from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from django.utils.text import slugify
import uuid
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
        """Duplicate a bike with all its variants and specifications"""
        original_bike = self.get_object()
        
        with transaction.atomic():
            # Create a copy of the bike with a unique slug
            new_bike = BikeModel.objects.create(
                brand=original_bike.brand,
                name=f"{original_bike.name} (Copy)",
                category=original_bike.category,
                slug=f"{original_bike.slug}-copy-{uuid.uuid4().hex[:8]}",
                engine_capacity=original_bike.engine_capacity,
                engine_type=original_bike.engine_type,
                max_power=original_bike.max_power,
                max_torque=original_bike.max_torque,
                fuel_system=original_bike.fuel_system,
                cooling_system=original_bike.cooling_system,
                gears=original_bike.gears,
                clutch_type=original_bike.clutch_type,
                curb_weight=original_bike.curb_weight,
                fuel_capacity=original_bike.fuel_capacity,
                seat_height=original_bike.seat_height,
                tyre_type=original_bike.tyre_type,
                braking_system=original_bike.braking_system,
                primary_image=original_bike.primary_image,
                price=original_bike.price,
                is_available=original_bike.is_available,
                popularity_score=0,  # Reset popularity score for new copy
            )
            
            # Duplicate variants
            for variant in original_bike.variants.all():
                new_variant = variant
                new_variant.pk = None
                new_variant.bike_model = new_bike
                new_variant.save()
                # Copy ManyToMany fields if any exist
                # (handle any M2M relationships on BikeVariant)
            
            # Duplicate specifications
            for spec in original_bike.specifications.all():
                new_spec = spec
                new_spec.pk = None
                new_spec.bike_model = new_bike
                new_spec.save()
        
        serializer = self.get_serializer(new_bike)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def upload_image(self, request):
        # Placeholder for standalone image upload if needed by frontend
        # Usually handled within create/update via Cloudinary
        return Response({"message": "Image upload logic here"}, status=status.HTTP_200_OK)
