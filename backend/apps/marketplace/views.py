from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import UsedBikeListing
from .serializers import UsedBikeListingSerializer, UsedBikeListingCreateSerializer

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
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
