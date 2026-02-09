from rest_framework import viewsets, filters, status
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
            # Use ImageProcessingService from marketplace if possible, 
            # or just save and return URL.
            # For simplicity and consistency, let's try to use the same service.
            from apps.marketplace.image_processor import ImageProcessingService
            from django.core.files.storage import default_storage
            from django.core.files.base import ContentFile
            import os
            
            # Process image
            processed = ImageProcessingService.compress_and_convert(image_file)
            
            # Save the primary processed version (WebP) or original
            best_file = processed.get('webp') or processed.get('compressed')

            # sanitize filename to avoid path traversal and invalid chars
            original_name = image_file.name
            base_name = os.path.basename(original_name)
            safe_name = get_valid_filename(base_name)
            prefixed = f"{uuid.uuid4().hex[:8]}_{safe_name}"

            if best_file:
                path = default_storage.save(
                    f"bikes/uploads/{prefixed}",
                    best_file['content']
                )
                url = default_storage.url(path)
                return Response({
                    "url": url,
                    "size": best_file['content'].size,
                    "originalSize": image_file.size
                }, status=status.HTTP_200_OK)
            else:
                # Fallback to saving original (sanitized name)
                path = default_storage.save(f"bikes/uploads/{prefixed}", image_file)
                url = default_storage.url(path)
                return Response({
                    "url": url,
                    "size": image_file.size,
                    "originalSize": image_file.size
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error while uploading image: %s", e)
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
