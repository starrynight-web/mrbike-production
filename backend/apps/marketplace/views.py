from rest_framework import viewsets, filters, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import UsedBikeListing
from .serializers import UsedBikeListingSerializer, UsedBikeListingCreateSerializer


class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Permission to check if user is the seller of the listing.
    Allows read-only access to all, but only sellers can update/delete their own listings.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the seller of the listing
        return obj.seller == request.user

class UsedBikeListingViewSet(viewsets.ModelViewSet):
    queryset = UsedBikeListing.objects.filter(status='active').order_by('-is_featured', '-created_at')

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['bike_model__brand', 'condition', 'location']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at', 'mileage']
    
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
        return [AllowAny()]
