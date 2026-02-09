from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'is_phone_verified',
            'location', 'profile_image', 'bio', 'role',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['username', 'date_joined', 'last_login', 'role']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'points', 'member_since', 'is_dealer']

class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
