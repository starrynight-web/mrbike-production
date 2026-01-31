from rest_framework import serializers
from .models import UsedBikeListing, ListingImage
from apps.bikes.serializers import BikeModelCompactSerializer

class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image_url', 'is_primary']

class UsedBikeListingSerializer(serializers.ModelSerializer):
    seller_name = serializers.ReadOnlyField(source='seller.username')
    bike_details = BikeModelCompactSerializer(source='bike_model', read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = UsedBikeListing
        fields = '__all__'
        read_only_fields = ['views_count', 'is_verified', 'created_at']

class UsedBikeListingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsedBikeListing
        exclude = ['views_count', 'is_verified', 'created_at']

