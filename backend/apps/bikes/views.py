from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Brand, BikeModel
from .serializers import BrandSerializer, BikeModelSerializer
from django.conf import settings
import logging
from django.utils.text import get_valid_filename
import uuid
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']
    
    @method_decorator(cache_page(60 * 15)) # 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.AllowAny()]

class BikeModelViewSet(viewsets.ModelViewSet):
    queryset = BikeModel.objects.all().order_by('-popularity_score', 'name')
    serializer_class = BikeModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'engine_capacity']
    search_fields = ['name', 'brand__name']
    ordering_fields = ['price', 'popularity_score', 'engine_capacity']

    @method_decorator(cache_page(60 * 10)) # 10 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 10))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_object(self):
        """
        Allow getting object by either ID or slug
        """
        # If the lookup parameter is not a number, treat it as a slug
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        if lookup_value and not str(lookup_value).isdigit():
            self.lookup_field = 'slug'
            # The URL kwarg is still 'pk' from DefaultRouter, so we must tell DRF to look there
            self.lookup_url_kwarg = 'pk'

        return super().get_object()

    permission_classes = [permissions.AllowAny] # Fallback for read actions
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'duplicate', 'upload_image']:
            return [IsAdminUser()]
        return [permissions.AllowAny()]

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
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate content type and size
        allowed_types = getattr(settings, 'ALLOWED_IMAGE_MIME_TYPES', [
            'image/jpeg', 'image/png', 'image/webp'
        ])
        max_bytes = getattr(settings, 'MAX_UPLOAD_BYTES', 5 * 1024 * 1024)  # default 5MB

        if image_file.content_type not in allowed_types:
            return Response({"error": "Unsupported image type"}, status=status.HTTP_400_BAD_REQUEST)

        if image_file.size > max_bytes:
            return Response({"error": "Image size exceeds limit"}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: attempt to open with Pillow to validate image integrity
        try:
            image_file.seek(0)
            img = Image.open(image_file)
            img.verify()
            image_file.seek(0)
        except (UnidentifiedImageError, OSError) as e:
            logger.warning("Uploaded file failed image validation: %s", e)
            return Response({"error": "Invalid image file"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            import cloudinary.uploader
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                image_file,
                folder='mrbikebd/uploads/',
                resource_type='image'
            )
            
            return Response({
                "url": result.get('secure_url'),
                "size": result.get('bytes'),
                "originalSize": image_file.size
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error while uploading image to Cloudinary: %s", e)
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.exception("Error while uploading image: %s", e)
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
