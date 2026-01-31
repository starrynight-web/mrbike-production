from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Brand, BikeModel
from .serializers import BrandSerializer, BikeModelSerializer

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']

class BikeModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BikeModel.objects.all().order_by('-popularity_score', 'name')
    serializer_class = BikeModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'engine_capacity']
    search_fields = ['name', 'brand__name']
    ordering_fields = ['price', 'popularity_score', 'engine_capacity']
