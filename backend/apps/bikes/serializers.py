from rest_framework import serializers
from .models import Brand, BikeModel, BikeVariant, BikeSpecification
from django.db.models import Q
import json

class BrandSerializer(serializers.ModelSerializer):
    bikeCount = serializers.SerializerMethodField()
    usedBikeCount = serializers.SerializerMethodField()
    country = serializers.CharField(source='origin_country', read_only=True)
    
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'logo', 'description', 
            'origin_country', 'country', 'bikeCount', 'usedBikeCount',
            'is_popular', 'created_at', 'updated_at'
        ]

    def get_bikeCount(self, obj):
        return obj.bikes.count()

    def get_usedBikeCount(self, obj):
        from apps.marketplace.models import UsedBikeListing
        return UsedBikeListing.objects.filter(
            Q(bike_model__brand=obj) | Q(custom_brand__iexact=obj.name),
            status='active'
        ).count()

class BikeVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = BikeVariant
        exclude = ['bike_model']

class BikeSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BikeSpecification
        exclude = ['bike_model']

class BikeModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    variants = BikeVariantSerializer(many=True, read_only=True)
    detailed_specs = BikeSpecificationSerializer(required=False)
    
    # Standard fields for writing, custom representation for reading
    primary_image = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image1 = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image2 = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image3 = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image4 = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    image5 = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    class Meta:
        model = BikeModel
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Resolve image URLs for frontend
        ret['primary_image'] = self.get_image_url(instance.primary_image)
        ret['image1'] = self.get_image_url(instance.image1)
        ret['image2'] = self.get_image_url(instance.image2)
        ret['image3'] = self.get_image_url(instance.image3)
        ret['image4'] = self.get_image_url(instance.image4)
        ret['image5'] = self.get_image_url(instance.image5)
        return ret
    
    def get_image_url(self, image_field):
        if not image_field:
            return None
            
        if hasattr(image_field, 'url') and image_field.url:
            url = image_field.url
            if url.startswith('http://'): return url.replace('http://', 'https://')
            return url
            
        import cloudinary.utils
        public_id = str(image_field)
        if not public_id or public_id == 'None':
            return None
            
        if "image/upload/" in public_id:
            public_id = public_id.split("image/upload/")[-1]
            import re
            public_id = re.sub(r'^v\d+/', '', public_id)
        if '.' in public_id:
            public_id = public_id.rsplit('.', 1)[0]
            
        try:
            url, _ = cloudinary.utils.cloudinary_url(
                public_id,
                secure=True,
                transformation=[{'quality': 'auto', 'fetch_format': 'auto'}]
            )
            return url
        except Exception:
            return None

    def _parse_variants_data(self, request_data):
        """Parse variants from either nested dict or JSON string."""
        variants_json = request_data.get('variants_data', None)
        if variants_json:
            try:
                if isinstance(variants_json, str):
                    return json.loads(variants_json)
                return variants_json
            except (json.JSONDecodeError, TypeError):
                pass
        return None

    def _handle_image_fields(self, request, instance):
        """Handle multipart image uploads from request.FILES."""
        image_fields = ['primary_image', 'image1', 'image2', 'image3', 'image4', 'image5']
        for field in image_fields:
            if field in request.FILES:
                setattr(instance, field, request.FILES[field])
        instance.save()

    def create(self, validated_data):
        specs_data = validated_data.pop('detailed_specs', None)
        
        # Handle image files from multipart/form-data
        request = self.context.get('request')
        
        bike_model = BikeModel.objects.create(**validated_data)
        
        # Handle image uploads if request has FILES
        if request and request.FILES:
            self._handle_image_fields(request, bike_model)
        
        # Create detailed specs
        if specs_data:
            BikeSpecification.objects.create(bike_model=bike_model, **specs_data)
        
        # Create variants from variants_data JSON
        if request:
            variants_data = self._parse_variants_data(request.data)
            if variants_data:
                for variant in variants_data:
                    BikeVariant.objects.create(bike_model=bike_model, **variant)

        return bike_model

    def update(self, instance, validated_data):
        specs_data = validated_data.pop('detailed_specs', None)
        request = self.context.get('request')
        
        # Update BikeModel fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle image uploads if request has FILES
        if request and request.FILES:
            self._handle_image_fields(request, instance)
        
        # Update or create detailed_specs
        if specs_data:
            specs_instance, _ = BikeSpecification.objects.get_or_create(bike_model=instance)
            for attr, value in specs_data.items():
                setattr(specs_instance, attr, value)
            specs_instance.save()
        
        # Update variants from variants_data JSON
        if request:
            variants_data = self._parse_variants_data(request.data)
            if variants_data is not None:
                # Delete existing variants and re-create
                instance.variants.all().delete()
                for variant in variants_data:
                    BikeVariant.objects.create(bike_model=instance, **variant)
            
        return instance

class BikeModelCompactSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    
    class Meta:
        model = BikeModel
        fields = ['id', 'brand_name', 'name', 'category', 'price', 'popularity_score']
