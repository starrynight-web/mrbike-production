from rest_framework import serializers
from .models import UsedBikeListing, ListingImage, ReportListing
from apps.bikes.serializers import BikeModelCompactSerializer
from apps.bikes.models import BikeModel
from apps.core.validators import DataValidator

class ListingImageSerializer(serializers.ModelSerializer):
    url = serializers.ReadOnlyField(source='get_best_url')
    compression_ratio = serializers.ReadOnlyField()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Use get_best_url which already includes security and optimization
        representation['url'] = instance.get_best_url
        return representation

    class Meta:
        model = ListingImage
        fields = [
            'id', 'original_image', 'webp_image', 'compressed_image', 
            'url', 'is_primary', 'order', 'compression_ratio',
            'file_size_original', 'file_size_webp'
        ]
        read_only_fields = ['webp_image', 'compressed_image', 'file_size_original', 'file_size_webp']

class ReportListingSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ReportListing
        fields = ['id', 'user', 'user_name', 'reason', 'description', 'created_at']
        read_only_fields = ['created_at']

class UsedBikeListingSerializer(serializers.ModelSerializer):
    seller_name = serializers.ReadOnlyField(source='seller.username')
    seller_phone = serializers.SerializerMethodField()
    seller_location = serializers.ReadOnlyField(source='location')
    location = serializers.SerializerMethodField()
    bike_details = serializers.SerializerMethodField()
    images = ListingImageSerializer(many=True, read_only=True)
    
    # ... rest remains same ...

    def get_location(self, obj):
        return {
            'city': obj.location_city or '',
            'area': obj.location_area or '',
            'full': obj.location or ''
        }
    
    # Computed fields for admin panel
    bike_model_name = serializers.SerializerMethodField()
    brand_name = serializers.SerializerMethodField()
    year = serializers.ReadOnlyField(source='manufacturing_year')
    image_url = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UsedBikeListing
        fields = [
            'id', 'seller', 'seller_name', 'seller_phone', 'seller_location',
            'bike_model', 'bike_details', 'custom_brand', 'custom_model',
            'title', 'slug', 'price', 'mileage', 'manufacturing_year', 
            'registration_year', 'condition', 'description', 'location',
            'location_city', 'location_area', 'location_division',
            'contact_number', 'whatsapp_number', 'has_accident_history', 'engine_condition',
            'body_condition', 'engine_cc', 'modifications', 'ownership_count', 'has_original_papers',
            'registration_type', 'expires_at', 'category', 'is_verified',
            'status', 'is_featured', 'is_urgent', 'views_count',
            'created_at', 'updated_at', 'images', 'bike_model_name',
            'brand_name', 'year', 'image_url', 'reports_count'
        ]
        read_only_fields = [
            'views_count', 'is_verified', 'created_at', 'updated_at',
            'rejection_reason', 'reviewed_at', 'reviewed_by', 'slug', 'expires_at',
            'reports_count'
        ]

    def get_seller_phone(self, obj):
        return getattr(obj.seller, 'phone', None) or obj.contact_number or ''

    def get_bike_details(self, obj):
        if not obj.bike_model:
            return None
        return BikeModelCompactSerializer(obj.bike_model).data

    def get_bike_model_name(self, obj):
        if obj.bike_model:
            return obj.bike_model.name
        return obj.custom_model or obj.title
    
    def get_brand_name(self, obj):
        if obj.bike_model and obj.bike_model.brand:
            return obj.bike_model.brand.name
        return obj.custom_brand or 'Unknown'
    
    def get_image_url(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if not primary_image:
            primary_image = obj.images.first()
        if primary_image:
            return primary_image.get_best_url
        return None

    def get_reports_count(self, obj):
        return obj.reports.count()


class UsedBikeListingCreateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=5000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = UsedBikeListing
        fields = [
            'bike_model', 'custom_brand', 'custom_model', 'title', 'price',
            'mileage', 'manufacturing_year', 'registration_year', 'condition',
            'description', 'location', 'location_city', 'location_area',
            'location_division', 'contact_number', 'whatsapp_number', 'has_accident_history',
            'engine_condition', 'body_condition', 'ownership_count', 'engine_cc',
            'has_original_papers', 'registration_year', 'category',
            'is_featured', 'is_urgent', 'uploaded_images', 'slug'
        ]
        extra_kwargs = {
            'custom_brand': {'required': False},
            'custom_model': {'required': False},
            'registration_year': {'required': False},
            'is_featured': {'required': False},
            'is_urgent': {'required': False},
            'contact_number': {'required': True},
            'whatsapp_number': {'required': False},
            'location_city': {'required': False},
            'engine_cc': {'required': False},
        }

    def validate_price(self, value):
        if value <= 0 or value > 5000000:
            raise serializers.ValidationError("Price must be between 1 and 5,000,000 BDT.")
        return value

    def validate_mileage(self, value):
        if value < 0 or value > 1000000:
            raise serializers.ValidationError("Mileage must be between 0 and 1,000,000 km.")
        return value

    def validate_contact_number(self, value):
        return DataValidator.validate_phone(value)

    def validate(self, data):
        # Sanitize all inputs
        return DataValidator.sanitize_dict(data)

    def create(self, validated_data):
        images_data = validated_data.pop('uploaded_images', [])
        
        # User is passed by view perform_create
        listing = UsedBikeListing.objects.create(**validated_data)
        
        from .image_processor import ImageProcessingService
        import cloudinary.uploader
        import logging
        
        logger = logging.getLogger(__name__)

        for i, image in enumerate(images_data):
            # Attempt processing and manual upload to bypass Djongo adaptation errors
            try:
                is_primary = (i == 0)
                
                # 1. Upload original image
                orig_result = cloudinary.uploader.upload(
                    image,
                    folder='mrbikebd/used-bikes/originals/',
                    resource_type='image'
                )
                
                # 2. Skip backend processing to reduce latency (frontend already compresses)
                # Cloudinary handles dynamic optimization via get_best_url property
                webp_public_id = None
                compressed_public_id = None
                
                # 3. Create ListingImage record with PUBLIC IDs (strings) to satisfy Djongo
                ListingImage.objects.create(
                    listing=listing,
                    original_image=orig_result['public_id'],
                    webp_image=webp_public_id,
                    compressed_image=compressed_public_id,
                    is_primary=is_primary,
                    order=i,
                    file_size_original=image.size if hasattr(image, 'size') else None,
                )
                
                logger.debug(f"Created ListingImage {i} for listing {listing.id}")
            except Exception as e:
                logger.error(f"Failed to manually upload/save ListingImage {i} for listing {listing.id}: {str(e)}")
        
        return listing
