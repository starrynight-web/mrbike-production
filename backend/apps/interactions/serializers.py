from rest_framework import serializers
from .models import Review, Wishlist
from apps.users.serializers import UserSerializer
from apps.bikes.serializers import BikeModelSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'is_verified_purchase', 'created_at']

class WishlistSerializer(serializers.ModelSerializer):
    bikes = BikeModelSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['bikes', 'updated_at']
