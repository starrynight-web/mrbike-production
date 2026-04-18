from rest_framework import viewsets, filters, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from apps.core.permissions import IsSuperAdminOnly, IsStaffWithRole
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Brand, BikeModel
from .serializers import BrandSerializer, BikeModelSerializer
from django.db.models import F, Q
from .filters import BikeModelFilter
from django.conf import settings
import logging
from django.utils.text import get_valid_filename
import uuid
from PIL import Image, UnidentifiedImageError
from .services.recommendation_engine import get_emotional_recommendations
from apps.interactions.models import UserViewHistory
from apps.marketplace.serializers import UsedBikeListingSerializer

logger = logging.getLogger(__name__)

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']
    
    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_object(self):
        """Allow getting brand by ID or slug"""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        if lookup_value and not str(lookup_value).isdigit():
            self.lookup_field = 'slug'
            self.lookup_url_kwarg = 'pk'

        return super().get_object()

    @action(detail=True, methods=['get'])
    def bikes(self, request, pk=None):
        """Get all bike models for this brand"""
        brand = self.get_object()
        # Default to name sorting to ensure predictable results (Phase 1 Fix)
        # Added select_related/prefetch_related for performance (Audit Gap)
        bikes = BikeModel.objects.filter(brand=brand).select_related('brand').prefetch_related('variants').order_by('name')
        
        page = self.paginate_queryset(bikes)
        if page is not None:
            serializer = BikeModelSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BikeModelSerializer(bikes, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsStaffWithRole(['staff_settings', 'staff_bikes'])()]
        if self.action in ['list', 'retrieve', 'bikes']:
            return [permissions.AllowAny()]
        return [IsStaffWithRole(['staff_settings', 'staff_bikes'])()]

class BikeModelViewSet(viewsets.ModelViewSet):
    serializer_class = BikeModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = BikeModelFilter
    search_fields = ['name', 'brand__name', 'category']
    ordering_fields = ['price', 'popularity_score', 'engine_capacity']

    def get_queryset(self):
        # Default to name sorting if no ordering is provided (Phase 1 Fix)
        # Optimized with select_related and prefetch_related (Audit Gap)
        queryset = BikeModel.objects.all().select_related('brand', 'detailed_specs').prefetch_related('variants').order_by('name')
        
        search_query = self.request.query_params.get('search')
        if search_query:
            from django.contrib.postgres.search import SearchVector
            queryset = queryset.annotate(
                search=SearchVector('name', 'brand__name', 'engine_type', 'category')
            ).filter(search=search_query)
            
        return queryset

    # Removed cache_page to fix Issue #1 (newly added bikes not appearing immediately)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Track view history for personalized recommendations
        if request.user.is_authenticated:
            # We use atomic update if it exists or create new
            UserViewHistory.objects.update_or_create(
                user=request.user,
                bike_model=instance,
                defaults={'view_count': F('view_count') + 1}
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def emotional_recommendations(self, request, pk=None):
        """
        Custom endpoint for the emotional trigger recommendation engine.
        """
        bike = self.get_object()
        recommendations = get_emotional_recommendations(bike, user=request.user)
        
        # Reuse UsedBikeListingSerializer for the recommendations
        serializer = UsedBikeListingSerializer(recommendations, many=True)
        return Response(serializer.data)

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

    permission_classes_by_action = {
        'default': [permissions.AllowAny],
        'create': [IsStaffWithRole('staff_bikes')],
        'update': [IsStaffWithRole('staff_bikes')],
        'partial_update': [IsStaffWithRole('staff_bikes')],
        'destroy': [IsStaffWithRole('staff_bikes')],
        'upload_image': [IsStaffWithRole('staff_bikes')],
        'duplicate': [IsStaffWithRole('staff_bikes')],
    }
    
    def get_permissions(self):
        # Instantiate and return the list of permissions that the view requires.
        return [permission() for permission in self.permission_classes_by_action.get(self.action, self.permission_classes_by_action['default'])]

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

    @action(detail=False, methods=['post'], permission_classes=[IsStaffWithRole('staff_bikes')])
    def import_json(self, request):
        """Import bike(s) from a JSON object or array."""
        data = request.data
        if not data:
            return Response({"error": "No data provided"}, status=400)
            
        if isinstance(data, dict):
            items = [data]
        else:
            items = data
            
        results = {"created": 0, "errors": []}
        
        for item in items:
            try:
                bike_name = item.get("Bike Name")
                if not bike_name:
                    results["errors"].append("Missing 'Bike Name'")
                    continue
                
                # Auto-detect Brand
                brand_name = bike_name.split(' ')[0]
                brand, _ = Brand.objects.get_or_create(
                    name__iexact=brand_name,
                    defaults={'name': brand_name}
                )
                
                # Category mapping
                category_map = {
                    "Sports": "sports",
                    "Naked": "naked",
                    "Cruiser": "cruiser",
                    "Commuter": "commuter",
                    "Scooter": "scooter",
                    "Adventure": "adventure",
                    "Cafe Racer": "cafe_racer",
                    "Off-Road": "offroad"
                }
                category = category_map.get(item.get("Category"), "commuter")
                
                # Clean Price
                price_str = item.get("Base Price", "0")
                import re
                price_val = re.sub(r'[^\d.]', '', price_str)
                price = float(price_val) if price_val else 0
                
                # Create BikeModel
                bike_model, created = BikeModel.objects.update_or_create(
                    name=bike_name,
                    brand=brand,
                    defaults={
                        'category': category,
                        'price': price,
                        'description': item.get("Description", ""),
                        'engine_capacity': int(re.sub(r'[^\d]', '', str(item.get("Displacement(CC)", "0"))) or 0),
                        'engine_type': item.get("Engine Type"),
                        'max_power': item.get("Max Power"),
                        'max_torque': item.get("Max Torque"),
                        'fuel_system': item.get("Fuel System"),
                        'cooling_system': item.get("Cooling System"),
                        'gears': int(re.sub(r'[^\d]', '', str(item.get("Gears", "5"))) or 5),
                        'clutch_type': item.get("Clutch"),
                        'curb_weight': float(re.sub(r'[^\d.]', '', str(item.get("Kerb Weight", "0"))) or 0),
                        'fuel_capacity': float(re.sub(r'[^\d.]', '', str(item.get("Fuel Capacity", "0"))) or 0),
                        'seat_height': float(re.sub(r'[^\d.]', '', str(item.get("Seat Height", "0"))) or 0),
                        'tyre_type': item.get("Front Tyre", "Tubeless"),
                    }
                )
                
                # Create Specifications
                from .models import BikeSpecification
                BikeSpecification.objects.update_or_create(
                    bike_model=bike_model,
                    defaults={
                        'engine_type': item.get("Engine Type"),
                        'displacement': str(item.get("Displacement(CC)")),
                        'max_power': item.get("Max Power"),
                        'max_torque': item.get("Max Torque"),
                        'fuel_system': item.get("Fuel System"),
                        'cooling_system': item.get("Cooling System"),
                        'gearbox': str(item.get("Gears")),
                        'clutch': item.get("Clutch"),
                        'gear_shift_pattern': item.get("Gear Shift Pattern"),
                        'spark_plugs': int(re.sub(r'[^\d]', '', str(item.get("Spark Plugs", "1"))) or 1),
                        'brakes_front': item.get("Front Brake"),
                        'brakes_rear': item.get("Rear Brake"),
                        'braking_system': item.get("Braking System"),
                        'tyres_front': item.get("Front Tyre"),
                        'tyres_rear': item.get("Rear Tyre"),
                        'kerb_weight': str(item.get("Kerb Weight")),
                        'fuel_tank_capacity': str(item.get("Fuel Capacity")),
                        'seat_height': str(item.get("Seat Height")),
                        'ground_clearance': str(item.get("Ground Clearance")),
                        'wheelbase': str(item.get("Wheelbase")),
                        'top_speed': item.get("Top Speed"),
                        'mileage_city': item.get("Mileage(City)"),
                        'mileage_highway': item.get("Mileage(Highway)"),
                        'usb_charging': item.get("USB Charging") == "Yes",
                        'side_stand_cut_off': item.get("Side Stand Cut-off") == "Yes",
                        'projector_headlight': item.get("Projector Headlight") == "Yes",
                        'drls': item.get("DRLs") == "Yes",
                        'gear_indicator': item.get("Gear Indicator") == "Yes",
                        'distance_to_empty': item.get("Distance to Empty") == "Yes",
                        'avg_fuel_consumption': item.get("Avg Fuel Consumption") == "Yes",
                    }
                )
                
                # Create Variants
                variants_list = item.get("Varriants", [])
                from .models import BikeVariant
                for v_item in variants_list:
                    BikeVariant.objects.update_or_create(
                        bike_model=bike_model,
                        variant_key=v_item.get("Variant Key", "std"),
                        defaults={
                            'variant_name': v_item.get("Varriant Name"),
                            'price': float(re.sub(r'[^\d.]', '', str(v_item.get("Price BDT", "0"))) or 0),
                            'braking_system': v_item.get("Braking System"),
                            'rear_brake_type': v_item.get("Rear Braking System"),
                            'tire_type': v_item.get("Tyre Type"),
                            'headlight_type': v_item.get("Headlight Type"),
                            'kerb_weight': v_item.get("Kerb Weight"),
                            'instrument_console': v_item.get("Instrument Console"),
                            'mobile_connectivity': v_item.get("Mobile Phone Connectivity") == "Yes",
                            'riding_modes': v_item.get("Riding Modes") == "Yes",
                            'traction_control': v_item.get("TRaction Control") == "Yes",
                            'slipper_clutch': v_item.get("Slipper/Assist Clutch") == "Yes",
                            'quick_shifter': v_item.get("Quick Shifter") == "Yes",
                            'seat_type': v_item.get("Seat Type"),
                        }
                    )
                
                results["created"] += 1
                
            except Exception as e:
                results["errors"].append(f"Error importing {item.get('Bike Name', 'Unknown')}: {str(e)}")
                
        return Response(results)

