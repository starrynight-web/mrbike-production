from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from apps.core.permissions import IsSuperAdminOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import UsedBikeListing
from .serializers import UsedBikeListingSerializer, UsedBikeListingCreateSerializer

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

from rest_framework.throttling import UserRateThrottle

class ImageUploadThrottle(UserRateThrottle):
    scope = 'image_upload'
    rate = '10/hour'

class UsedBikeListingViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    throttle_classes = [ImageUploadThrottle]
    filterset_fields = ['bike_model__brand', 'condition', 'location', 'status']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at', 'mileage']
    
    def get_queryset(self):
        queryset = UsedBikeListing.objects.all().order_by('-created_at')
        user = self.request.user
        
        # Staff can see all listings but only when explicitly requested!
        # This prevents "auto-posting" leaks in the public feed.
        if user and user.is_staff:
            status_filter = self.request.query_params.get('status')
            if status_filter == 'active':
                return queryset.filter(status='active')
            elif status_filter == 'all':
                return queryset
            elif status_filter == 'rejected':
                return queryset.filter(status='rejected')
            
            # Default for staff with no filter: show all listings
            return queryset
        
        # Registered users see ONLY active listings in the public feed
        # Sellers can view their own listings via the /my-listings/ endpoint
        if user and user.is_authenticated:
            return queryset.filter(status='active').order_by('-is_featured', '-created_at')
            
        # Anonymous users only see active listings
        return queryset.filter(status='active').order_by('-is_featured', '-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsedBikeListingCreateSerializer
        return UsedBikeListingSerializer

    def perform_create(self, serializer):
        # Force status to pending for safety, regardless of user role or frontend input
        serializer.save(seller=self.request.user, status='pending')

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSellerOrReadOnly()]
        elif self.action in ['approve', 'reject']:
            return [IsSuperAdminOnly()]
        return [AllowAny()]

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=401
            )
        listings = UsedBikeListing.objects.filter(seller=request.user).order_by('-created_at')
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        listing = self.get_object()
        
        # Optionally update category during approval
        category = request.data.get('category')
        if category:
            listing.category = category
            
        listing.status = 'active'
        listing.is_verified = True
        listing.reviewed_by = request.user
        listing.reviewed_at = timezone.now()
        listing.save()
        return Response({"status": "active", "message": "Listing has been approved and is now active."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        listing = self.get_object()
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {"error": "A rejection reason is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        listing.status = 'rejected'
        listing.rejection_reason = reason
        listing.reviewed_by = request.user
        listing.reviewed_at = timezone.now()
        listing.save()
        
        # Send rejection email to seller
        from apps.users.services.email_service import email_service
        from apps.users.models import Notification
        
        seller = listing.seller
        if seller.email:
            email_service.send_rejection_email(
                to_email=seller.email,
                listing_title=listing.title,
                reason=reason,
                to_name=seller.first_name or seller.username
            )
        
        # Create in-app notification
        Notification.objects.create(
            user=seller,
            title="Listing Not Approved",
            message=f'Your listing "{listing.title}" was not approved. Reason: {reason}'
        )
        
        return Response({"status": "rejected", "message": "Listing has been rejected and seller has been notified."})
