from rest_framework import viewsets, filters, status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from apps.core.permissions import IsSuperAdminOnly, IsStaffWithRole
from apps.core.authentication import LenientJWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count
from .models import Brand, BikeModel
from .serializers import BrandSerializer, BikeModelSerializer
from django.db.models import F, Q
from .filters import BikeModelFilter
from django.conf import settings
import logging
from django.utils.text import get_valid_filename
import uuid
from PIL import Image, UnidentifiedImageError
from apps.marketplace.serializers import UsedBikeListingSerializer

from apps.recommendations.engine import BikeRecommender
from apps.interactions.models import UserViewHistory

logger = logging.getLogger(__name__)

from django.utils.decorators import method_decorator
from django.utils.decorators import method_decorator

class BrandViewSet(viewsets.ModelViewSet):
    authentication_classes = [LenientJWTAuthentication]
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'origin']

    def get_queryset(self):
        # Annotate bike_count in a single SQL query to eliminate N+1 per brand.
        # The serializer reads obj._bike_count if present, falling back to obj.bikes.count().
        return Brand.objects.annotate(_bike_count=Count('bikes', distinct=True)).order_by('name')

    def list(self, request, *args, **kwargs):
        from apps.core.cache_utils import generate_cache_key, cache_aside_get, cache_aside_set
        cache_key = generate_cache_key('brands', 'list', **request.query_params.dict())
        cached_response = cache_aside_get(cache_key)
        if cached_response:
            return cached_response
        
        response = super().list(request, *args, **kwargs)
        # 5-minute TTL: brand bike_count changes whenever bikes are added/removed.
        # Signals invalidate the version key on write, but a short TTL ensures
        # freshness even if Redis is unavailable or the signal is missed.
        cache_aside_set(cache_key, response.data, timeout=60 * 5)
        return response

    def retrieve(self, request, *args, **kwargs):
        from apps.core.cache_utils import generate_cache_key, cache_aside_get, cache_aside_set
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        cache_key = generate_cache_key('brands', 'retrieve', identifier=lookup_value)
        cached_response = cache_aside_get(cache_key)
        if cached_response:
            return cached_response
        
        response = super().retrieve(request, *args, **kwargs)
        cache_aside_set(cache_key, response.data, timeout=60 * 5)
        return response

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

class BikePagination(PageNumberPagination):
    page_size_query_param = 'limit'
    max_page_size = 2000

class BikeModelViewSet(viewsets.ModelViewSet):
    pagination_class = BikePagination
    authentication_classes = [LenientJWTAuthentication]
    serializer_class = BikeModelSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = BikeModelFilter
    search_fields = ['name', 'brand__name', 'category']
    ordering_fields = ['price', 'popularity_score', 'engine_capacity']

    def get_queryset(self):
        # Default to name sorting if no ordering is provided (Phase 1 Fix)
        # Optimized with select_related and prefetch_related (Audit Gap)
        queryset = BikeModel.objects.all().select_related('brand', 'detailed_specs').prefetch_related('variants').order_by('name')
        
        search_query = self.request.GET.get('search')
        if search_query:
            from django.contrib.postgres.search import SearchVector
            queryset = queryset.annotate(
                search=SearchVector('name', 'brand__name', 'engine_type', 'category')
            ).filter(search=search_query)
            
        return queryset

    def list(self, request, *args, **kwargs):
        from apps.core.cache_utils import generate_cache_key, cache_aside_get, cache_aside_set
        cache_key = generate_cache_key('bikes', 'list', **request.query_params.dict())
        cached_response = cache_aside_get(cache_key)
        if cached_response:
            return cached_response
        
        response = super().list(request, *args, **kwargs)
        cache_aside_set(cache_key, response.data, timeout=60 * 60 * 24)
        return response

    def retrieve(self, request, *args, **kwargs):
        from apps.core.cache_utils import generate_cache_key, cache_aside_get, cache_aside_set
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        cache_key = generate_cache_key('bikes', 'retrieve', identifier=lookup_value)
        cached_response = cache_aside_get(cache_key)
        if cached_response:
            # For cached views, we should still increment popularity async or bypass to save time
            # Since caching is prioritized, we will skip DB hits if it's purely a read.
            # But we must ensure the view count is somewhat accurate. Let's offload to background.
            try:
                from django_q.tasks import async_task
                async_task('apps.bikes.tasks.log_bike_view', lookup_value, request.user.id if request.user.is_authenticated else None, request.session.session_key or request.META.get('HTTP_X_SESSION_ID', 'anonymous'))
            except Exception:
                pass
            return cached_response
        instance = self.get_object()
        
        # 1. Atomic increment of popularity score
        BikeModel.objects.filter(pk=instance.pk).update(popularity_score=F('popularity_score') + 1)
        
        # 2. Log behavior for recommendation engine (supports both logged-in and guest via session)
        from apps.recommendations.models import UserBehaviorLog
        session_id = request.session.session_key or request.META.get('HTTP_X_SESSION_ID', 'anonymous')
        
        UserBehaviorLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
            behavior_type='view',
            bike_model=instance
        )

        # 3. Legacy view history tracking (for backward compatibility)
        if request.user.is_authenticated:
            from apps.interactions.models import UserViewHistory
            history, created = UserViewHistory.objects.get_or_create(
                user=request.user,
                bike_model=instance,
                defaults={'view_count': 1}
            )
            if not created:
                UserViewHistory.objects.filter(pk=history.pk).update(view_count=F('view_count') + 1)
        
        
        serializer = self.get_serializer(instance)
        response_data = serializer.data
        cache_aside_set(cache_key, response_data, timeout=60 * 60 * 24)
        return Response(response_data)

    @action(detail=True, methods=['get'])
    def emotional_recommendations(self, request, pk=None):
        """
        Custom endpoint for the emotional trigger recommendation engine.
        """
        bike = self.get_object()
        recommender = BikeRecommender(user=request.user)
        recommendations = recommender.get_recommendations(context_bike=bike)
        
        # Format slots for response
        from apps.marketplace.serializers import UsedBikeListingSerializer
        from .serializers import SimilarBikeSerializer # Using a lightweight serializer
        
        data = {}
        for slot, item in recommendations.items():
            if item:
                # If it's a UsedBikeListing, we might want to return its bike_model for consistency
                # but let's see what the frontend expects.
                # Usually it expects a bike-like object.
                data[slot] = SimilarBikeSerializer(item).data
            else:
                data[slot] = None
                
        return Response(data)

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
        # Use integer timestamp to avoid dots which break URL routing
        bike.slug = f"{bike.slug}-copy-{int(timezone.now().timestamp())}"
        bike.save()
        serializer = self.get_serializer(bike)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='upload-image')
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
                bike_name = item.get("Bike Name") or item.get("name")
                if not bike_name:
                    results["errors"].append("Missing 'Bike Name' or 'name'")
                    continue
                
                # Auto-detect Brand
                brand_name = item.get("brand") or bike_name.split(' ')[0]
                brand, _ = Brand.objects.get_or_create(
                    name__iexact=brand_name,
                    defaults={'name': brand_name}
                )
                
                # Category mapping
                category_map = {
                    "sports": "sports",
                    "naked": "naked",
                    "cruiser": "cruiser",
                    "commuter": "commuter",
                    "scooter": "scooter",
                    "adventure": "adventure",
                    "cafe racer": "cafe_racer",
                    "cafe_racer": "cafe_racer",
                    "off-road": "offroad",
                    "offroad": "offroad"
                }
                raw_category = str(item.get("Category", item.get("category", ""))).lower()
                category = category_map.get(raw_category, "commuter")
                
                # Clean Price
                price_str = str(item.get("Base Price", item.get("price", "0")))
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
                        'engine_capacity': int(re.sub(r'[^\d]', '', str(item.get("Displacement(CC)", item.get("engine_capacity", "0")))) or 0),
                        'engine_type': item.get("Engine Type", item.get("engine_type")),
                        'max_power': item.get("Max Power", item.get("max_power")),
                        'max_torque': item.get("Max Torque", item.get("max_torque")),
                        'fuel_system': item.get("Fuel System", item.get("fuel_system")),
                        'cooling_system': item.get("Cooling System", item.get("cooling_system")),
                        'gears': int(re.sub(r'[^\d]', '', str(item.get("Gears", item.get("gears", "5")))) or 5),
                        'clutch_type': item.get("Clutch", item.get("clutch_type")),
                        'curb_weight': float(re.sub(r'[^\d.]', '', str(item.get("Kerb Weight", item.get("curb_weight", "0")))) or 0),
                        'fuel_capacity': float(re.sub(r'[^\d.]', '', str(item.get("Fuel Capacity", item.get("fuel_capacity", "0")))) or 0),
                        'seat_height': float(re.sub(r'[^\d.]', '', str(item.get("Seat Height", item.get("seat_height", "0")))) or 0),
                        'tyre_type': item.get("Front Tyre", item.get("tyre_type", "Tubeless")),
                        'advantages': item.get("advantages", item.get("Advantages", [])),
                        'disadvantages': item.get("disadvantages", item.get("Disadvantages", [])),
                        'faqs': item.get("faqs", item.get("FAQs", [])),
                    }
                )
                
                # Create Specifications
                from .models import BikeSpecification
                detailed = item.get("detailed_specs", {})
                BikeSpecification.objects.update_or_create(
                    bike_model=bike_model,
                    defaults={
                        'engine_type': detailed.get("engine_type", item.get("Engine Type")),
                        'displacement': str(detailed.get("displacement", item.get("Displacement(CC)"))),
                        'max_power': detailed.get("max_power", item.get("Max Power")),
                        'max_torque': detailed.get("max_torque", item.get("Max Torque")),
                        'fuel_system': detailed.get("fuel_system", item.get("Fuel System")),
                        'cooling_system': detailed.get("cooling_system", item.get("Cooling System")),
                        'gearbox': str(detailed.get("gearbox", item.get("Gears"))),
                        'clutch': detailed.get("clutch", item.get("Clutch")),
                        'gear_shift_pattern': detailed.get("gear_shift_pattern", item.get("Gear Shift Pattern")),
                        'spark_plugs': int(re.sub(r'[^\d]', '', str(detailed.get("spark_plugs", item.get("Spark Plugs", "1")))) or 1),
                        'brakes_front': detailed.get("brakes_front", item.get("Front Brake")),
                        'brakes_rear': detailed.get("brakes_rear", item.get("Rear Brake")),
                        'braking_system': detailed.get("braking_system", item.get("Braking System")),
                        'tyres_front': detailed.get("tyres_front", item.get("Front Tyre")),
                        'tyres_rear': detailed.get("tyres_rear", item.get("Rear Tyre")),
                        'kerb_weight': str(detailed.get("kerb_weight", item.get("Kerb Weight"))),
                        'fuel_tank_capacity': str(detailed.get("fuel_tank_capacity", item.get("Fuel Capacity"))),
                        'seat_height': str(detailed.get("seat_height", item.get("Seat Height"))),
                        'ground_clearance': str(detailed.get("ground_clearance", item.get("Ground Clearance"))),
                        'wheelbase': str(detailed.get("wheelbase", item.get("Wheelbase"))),
                        'top_speed': detailed.get("top_speed", item.get("Top Speed")),
                        'mileage_city': detailed.get("mileage_city", item.get("Mileage(City)")),
                        'mileage_highway': detailed.get("mileage_highway", item.get("Mileage(Highway)")),
                        'usb_charging': detailed.get("usb_charging", item.get("USB Charging") == "Yes"),
                        'side_stand_cut_off': detailed.get("side_stand_cut_off", item.get("Side Stand Cut-off") == "Yes"),
                        'projector_headlight': detailed.get("projector_headlight", item.get("Projector Headlight") == "Yes"),
                        'drls': detailed.get("drls", item.get("DRLs") == "Yes"),
                        'gear_indicator': detailed.get("gear_indicator", item.get("Gear Indicator") == "Yes"),
                        'distance_to_empty': detailed.get("distance_to_empty", item.get("Distance to Empty") == "Yes"),
                        'avg_fuel_consumption': detailed.get("avg_fuel_consumption", item.get("Avg Fuel Consumption") == "Yes"),
                    }
                )
                
                # Create Variants
                variants_list = item.get("variants") or item.get("Variants") or item.get("Varriants") or []
                from .models import BikeVariant
                for v_item in variants_list:
                    BikeVariant.objects.update_or_create(
                        bike_model=bike_model,
                        variant_key=v_item.get("variant_key", v_item.get("Variant Key", "std")),
                        defaults={
                            'variant_name': v_item.get("variant_name", v_item.get("Variant Name", v_item.get("Varriant Name"))),
                            'price': float(re.sub(r'[^\d.]', '', str(v_item.get("price", v_item.get("Price BDT", "0")))) or 0),
                            'braking_system': v_item.get("braking_system", v_item.get("Braking System")),
                            'rear_brake_type': v_item.get("rear_brake_type", v_item.get("Rear Braking System")),
                            'tire_type': v_item.get("tire_type", v_item.get("Tyre Type")),
                            'headlight_type': v_item.get("headlight_type", v_item.get("Headlight Type")),
                            'kerb_weight': v_item.get("kerb_weight", v_item.get("Kerb Weight")),
                            'instrument_console': v_item.get("instrument_console", v_item.get("Instrument Console")),
                            'mobile_connectivity': v_item.get("mobile_connectivity", v_item.get("Mobile Phone Connectivity") == "Yes"),
                            'riding_modes': v_item.get("riding_modes", v_item.get("Riding Modes") == "Yes"),
                            'traction_control': v_item.get("traction_control", v_item.get("Traction Control", v_item.get("TRaction Control")) == "Yes"),
                            'slipper_clutch': v_item.get("slipper_clutch", v_item.get("Slipper/Assist Clutch") == "Yes"),
                            'quick_shifter': v_item.get("quick_shifter", v_item.get("Quick Shifter") == "Yes"),
                            'seat_type': v_item.get("seat_type", v_item.get("Seat Type")),
                        }
                    )
                
                results["created"] += 1
                
            except Exception as e:
                results["errors"].append(f"Error importing {item.get('name', item.get('Bike Name', 'Unknown'))}: {str(e)}")
                
        return Response(results)

