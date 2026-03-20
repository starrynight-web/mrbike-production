from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from apps.core.responses import StandardResponse
from apps.core.permissions import IsSuperAdminOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
import django.views.decorators.vary
import os
from .models import UsedBikeListing, ReportListing
from .serializers import (
    UsedBikeListingSerializer, 
    UsedBikeListingCreateSerializer,
    ReportListingSerializer
)
from .filters import UsedBikeListingFilter
from .services import UsedBikeListingService

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Permission to check if user is the seller of the listing.
    Allows read-only access to all, but only sellers can update/delete their own listings.
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user

class UsedBikeListingViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = UsedBikeListingFilter
    search_fields = ['title', 'description', 'location', 'location_city']
    ordering_fields = ['price', 'created_at', 'mileage']
    
    def get_object(self):
        """Allow getting listing by ID or slug"""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        if lookup_value and not str(lookup_value).isdigit():
            self.lookup_field = 'slug'
            self.lookup_url_kwarg = 'pk'

        return super().get_object()

    @method_decorator(cache_page(60 * 5, key_prefix="marketplace_list"))
    @method_decorator(django.views.decorators.vary.vary_on_headers('Authorization', 'Cookie'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        from django.db.models import F
        UsedBikeListing.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db(fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = UsedBikeListing.objects.all().select_related('seller', 'bike_model', 'bike_model__brand')
        user = self.request.user
        
        # Priority 1: Admin moderation entries
        if user and user.is_staff and self.action in ['list', 'retrieve', 'approve', 'reject']:
            status_param = self.request.query_params.get('status')
            if status_param in ['pending', 'rejected', 'active', 'sold', 'expired']:
                return queryset.filter(status=status_param).order_by('-created_at')
            elif status_param == 'all':
                return queryset.order_by('-created_at')
            return queryset.order_by('-created_at')

        # Priority 2: Public feed
        queryset = queryset.filter(status='active')
        return queryset.order_by('-is_featured', '-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsedBikeListingCreateSerializer
        return UsedBikeListingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return StandardResponse.success(
                data=serializer.data,
                message="Your listing has been posted successfully and is now under review.",
                status_code=status.HTTP_201_CREATED
            )
        
        return StandardResponse.error(
            message="There were errors in your listing information.",
            errors=serializer.errors
        )

    def perform_create(self, serializer):
        images = self.request.FILES.getlist('uploaded_images')
        serializer.save(
            seller=self.request.user, 
            status='pending',
            uploaded_images=images
        )

    def get_permissions(self):
        from apps.core.permissions import IsVerifiedSeller, IsEmailVerified
        
        if self.action == 'create':
            return [IsAuthenticated(), IsVerifiedSeller()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSellerOrReadOnly()]
        elif self.action in ['approve', 'reject']:
            return [IsSuperAdminOnly()]
        return [AllowAny()]

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=401)
        listings = UsedBikeListing.objects.filter(seller=request.user).order_by('-created_at')
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        category = request.data.get('category')
        try:
            listing = UsedBikeListingService.approve_listing(
                listing_id=pk, 
                reviewer=request.user, 
                category=category
            )
            data = {"status": "active", "id": listing.id}
            return StandardResponse.success(data=data, message="Listing has been approved and is now active.")
        except UsedBikeListing.DoesNotExist:
            return StandardResponse.error(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logging.error(f"Error approving listing {pk}: {e}")
            return StandardResponse.error(message="An error occurred while approving the listing.", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reason = request.data.get('reason', '')
        if not reason:
            return StandardResponse.error(message="A rejection reason is required.", status_code=status.HTTP_400_BAD_REQUEST)
        
        try:
            listing = UsedBikeListingService.reject_listing(
                listing_id=pk,
                reviewer=request.user,
                reason=reason
            )
            data = {"status": "rejected", "id": listing.id}
            return StandardResponse.success(data=data, message="Listing has been rejected and seller has been notified.")
        except UsedBikeListing.DoesNotExist:
            return StandardResponse.error(message="Listing not found.", status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import logging
            logging.error(f"Error rejecting listing {pk}: {e}")
            return StandardResponse.error(message="An error occurred while rejecting the listing.", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None):
        listing = self.get_object()
        serializer = ReportListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(listing=listing, user=request.user)
            return StandardResponse.success(
                data=serializer.data,
                message="Thank you for your report.",
                status_code=status.HTTP_201_CREATED
            )
        return StandardResponse.error(message="Invalid report data.", errors=serializer.errors)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def reports(self, request, pk=None):
        listing = self.get_object()
        reports = listing.reports.all()
        serializer = ReportListingSerializer(reports, many=True)
        return StandardResponse.success(data=serializer.data)
