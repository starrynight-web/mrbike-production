from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
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
        
        # Staff can see all listings
        if self.request.user and self.request.user.is_staff:
            status_filter = self.request.query_params.get('status')
            if status_filter and status_filter != 'all':
                queryset = queryset.filter(status=status_filter)
            return queryset
        
        # Regular users only see active listings
        return queryset.filter(status='active').order_by('-is_featured', '-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsedBikeListingCreateSerializer
        return UsedBikeListingSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSellerOrReadOnly()]
        elif self.action in ['approve', 'reject']:
            return [IsAdminUser()]
        return [AllowAny()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
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
        listing.status = 'active'
        listing.save()
        return Response({"status": "approved"})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        listing = self.get_object()
        listing.status = 'rejected'
        listing.save()
        return Response({"status": "rejected"})
