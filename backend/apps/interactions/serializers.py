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
        fields = ['id', 'user', 'bike', 'bike_name', 'bike_slug', 'rating', 'performance_rating', 'looks_rating', 'reliability_rating', 'comment', 'mileage_claimed', 'top_speed_claimed', 'is_verified_purchase', 'created_at']
        read_only_fields = ['bike', 'bike_name', 'bike_slug', 'created_at']

class WishlistSerializer(serializers.ModelSerializer):
    bikes = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = ['user', 'bikes', 'updated_at']

    def get_bikes(self, obj):
        from apps.bikes.serializers import BikeModelSerializer
        # obj.bikes is a Manager for the ManyToMany relationship
        return BikeModelSerializer(obj.bikes.all(), many=True).data

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'company', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']
