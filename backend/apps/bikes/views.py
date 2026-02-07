from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Brand, BikeModel
from .serializers import BrandSerializer, BikeModelSerializer

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return []

class BikeModelViewSet(viewsets.ModelViewSet):
    queryset = BikeModel.objects.all().order_by('-popularity_score', 'name')
    serializer_class = BikeModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'engine_capacity']
    search_fields = ['name', 'brand__name']
    ordering_fields = ['price', 'popularity_score', 'engine_capacity']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'duplicate', 'upload_image']:
            return [IsAdminUser()]
        return []

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        bike = self.get_object()
        bike.pk = None
        bike.name = f"{bike.name} (Copy)"
        bike.slug = f"{bike.slug}-copy-{timezone.now().timestamp()}"
        bike.save()
        serializer = self.get_serializer(bike)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        # Placeholder for standalone image upload if needed by frontend
        # Usually handled within create/update via Cloudinary
        return Response({"message": "Image upload logic here"}, status=status.HTTP_200_OK)
