"""
Review serializer for bike reviews
"""
from rest_framework import serializers
from .models import Review
from apps.users.models import User


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for bike reviews"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    bike_name = serializers.CharField(source='bike.name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'bike', 'bike_name', 'user', 'user_name', 'user_email',
            'rating', 'title', 'comment', 'is_approved', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'is_approved', 'created_at', 'updated_at']
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
