from rest_framework import serializers
from .models import Brand, BikeModel

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'

class BikeModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    
    class Meta:
        model = BikeModel
        fields = '__all__'

class BikeModelCompactSerializer(serializers.ModelSerializer):
    brand_name = serializers.ReadOnlyField(source='brand.name')
    
    class Meta:
        model = BikeModel
        fields = ['id', 'brand_name', 'name', 'category', 'price', 'popularity_score']
