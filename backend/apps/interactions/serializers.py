from rest_framework import serializers
from .models import Review, Wishlist, Inquiry
from apps.users.serializers import UserSerializer
from apps.bikes.serializers import BikeModelSerializer

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    bike_name = serializers.SerializerMethodField()
    bike_slug = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'bike_id', 'bike_name', 'bike_slug', 'rating', 'comment', 'is_verified_purchase', 'created_at']

    def get_bike_name(self, obj):
        try:
            from apps.bikes.models import BikeModel
            bike = BikeModel.objects.get(pk=obj.bike_id)
            return bike.name
        except Exception:
            return f"Bike {obj.bike_id}"

    def get_bike_slug(self, obj):
        try:
            from apps.bikes.models import BikeModel
            bike = BikeModel.objects.get(pk=obj.bike_id)
            return bike.slug
        except Exception:
            return ""

class WishlistSerializer(serializers.ModelSerializer):
    bikes = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = ['bikes', 'updated_at']

    def get_bikes(self, obj):
        if not obj.bike_ids:
            return []
        try:
            from apps.bikes.models import BikeModel
            from apps.bikes.serializers import BikeModelSerializer
            bikes = BikeModel.objects.filter(id__in=obj.bike_ids)
            return BikeModelSerializer(bikes, many=True).data
        except Exception:
            return []

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'company', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']
