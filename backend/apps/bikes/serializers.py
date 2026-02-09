from rest_framework import serializers
from .models import Brand, BikeModel, BikeVariant, BikeSpecification

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class BikeVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = BikeVariant
        fields = '__all__'

class BikeSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BikeSpecification
        exclude = ['bike_model']

class BikeModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    variants = BikeVariantSerializer(many=True, read_only=True)
    detailed_specs = BikeSpecificationSerializer(read_only=True)
    
    class Meta:
        model = BikeModel
        fields = '__all__'

class BikeModelCompactSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    
    class Meta:
        model = BikeModel
        fields = ['id', 'brand_name', 'name', 'category', 'price', 'popularity_score']
