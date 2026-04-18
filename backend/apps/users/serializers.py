from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, Notification
from apps.core.validators import DataValidator

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    membership = serializers.CharField(source='membership.plan.name', read_only=True, allow_null=True)
    membership_expires = serializers.DateTimeField(source='membership.expires_at', read_only=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_email_verified', 'location', 'profile_image', 'bio', 'role',
            'date_joined', 'last_login', 'membership', 'membership_expires'
        ]
        read_only_fields = ['username', 'date_joined', 'last_login', 'role', 'is_email_verified']


    def validate(self, data):
        return DataValidator.sanitize_dict(data)

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'points', 'member_since', 'is_dealer']

class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("An email address is required.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


    def validate(self, data):
        return DataValidator.sanitize_dict(data)

    def create(self, validated_data):
        from .views import generate_unique_username
        email = validated_data['email']
        username = validated_data.get('username', '').strip()
        if not username:
            username = generate_unique_username(email, User)
        
        user = User.objects.create_user(
            email=email,
            username=username,
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user

class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
