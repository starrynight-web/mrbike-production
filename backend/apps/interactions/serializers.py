from rest_framework import serializers
from .models import Review, Wishlist, Inquiry
from apps.users.serializers import UserSerializer
from apps.bikes.serializers import BikeModelSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bike_name = serializers.ReadOnlyField(source='bike.name')
    bike_slug = serializers.ReadOnlyField(source='bike.slug')
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'bike_name', 'bike_slug', 'rating', 'comment', 'is_verified_purchase', 'created_at']

class WishlistSerializer(serializers.ModelSerializer):
    bikes = BikeModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['bikes', 'updated_at']

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'company', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']
