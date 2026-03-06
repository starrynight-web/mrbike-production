from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from apps.core.responses import StandardResponse
from rest_framework.throttling import UserRateThrottle
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
import secrets
import hmac
import hashlib
import logging

# Google token verification
import google.oauth2.id_token
import google.auth.transport.requests

from .serializers import (
    GoogleAuthSerializer, UserSerializer, NotificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    RegisterSerializer, EmailLoginSerializer
)
from apps.core.responses import StandardResponse
# marketplace and interactions imports are done lazily inside views to avoid Djongo import-time SQL errors
from .models import Notification, EmailVerificationToken
from .services.email_service import email_service
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

User = get_user_model()
logger = logging.getLogger(__name__)


# Throttle Classes
class LoginThrottle(UserRateThrottle):
    """Rate limit login attempts to 5 per minute"""
    scope = 'login'
    rate = '5/min'


class RegisterThrottle(UserRateThrottle):
    """Rate limit registration to 10 per hour"""
    scope = 'register'
    rate = '10/hour'


def generate_unique_username(identifier: str, UserModel, max_attempts: int = 10) -> str:
    """Generate a deterministic, unique username based on an identifier (email/phone).
    Appends a short deterministic hex suffix if collision occurs.
    """
    base = (identifier.split('@')[0] if '@' in (identifier or '') else identifier or '')[:30]
    username = base or 'user'
    attempt = 0
    while UserModel.objects.filter(username=username).exists() and attempt < max_attempts:
        seed = f"{identifier}-{attempt}"
        suffix = hashlib.sha256(seed.encode()).hexdigest()[:4]
        username = f"{base}-{suffix}"
        attempt += 1
    if UserModel.objects.filter(username=username).exists():
        # fallback: append random token
        username = f"{base}-{secrets.token_hex(3)}"
    return username

class GoogleAuthView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = GoogleAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token = serializer.validated_data.get('id_token')

        # Verify the token with Google's token endpoint
        try:
            request_adapter = google.auth.transport.requests.Request()
            idinfo = google.oauth2.id_token.verify_oauth2_token(
                id_token,
                request_adapter,
                getattr(settings, 'GOOGLE_CLIENT_ID', None)
            )
        except ValueError as e:
            logger.warning(f"Invalid Google ID token: {e}")
            return Response({'detail': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

        email = idinfo.get('email')
        name = idinfo.get('name', '')

        # Lookup by email only (avoid username collisions)
        user = User.objects.filter(email=email).first()
        created = False
        if not user:
            # Compute first and last name once
            parts = name.split(' ', 1) if name else ['','']
            first_name = parts[0] if parts else ''
            last_name = parts[1] if len(parts) > 1 else ''

            username = generate_unique_username(email, User)
            user = User.objects.create(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True,  # Google-verified emails are trusted
            )
            created = True

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'created': created,
        })


class UserDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        listings_count = UsedBikeListing.objects.filter(seller=user).count()
        wishlist = Wishlist.objects.filter(user=user).first()
        wishlist_count = wishlist.bikes.count() if wishlist else 0
        reviews_count = Review.objects.filter(user=user).count()
        
        return Response({
            "listings_count": listings_count,
            "wishlist_count": wishlist_count,
            "reviews_count": reviews_count,
            "member_since": user.date_joined.strftime("%b %Y"),
        })

class NotificationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes = [RegisterThrottle]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create verification token (24h expiry - industry standard)
        token = EmailVerificationToken.objects.create(
            user=user,
            expires_at=timezone.now() + timezone.timedelta(hours=24)
        )
        email_service.send_verification_email(
            to_email=user.email,
            token=str(token.token),
            to_name=user.first_name or user.username
        )
        
        data = {
            'email': user.email,
        }
        return Response(
            {'message': 'Registration successful! Please check your email to verify your account.', 'email': user.email},
            status=status.HTTP_201_CREATED
        )


class EmailLoginView(generics.GenericAPIView):
    """Login with email and password. Requires email verification."""
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = EmailLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check email verification
        if not user.is_email_verified:
            return Response(
                {'error': 'Please verify your email before logging in.', 'needs_verification': True},
                status=status.HTTP_403_FORBIDDEN
            )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })


class LogoutView(APIView):
    """Logout by blacklisting the refresh token"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class UserSessionView(APIView):
    """Get currently authenticated user info for session persistence"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EmailVerifyView(APIView):
    """Verify email using token from verification email"""
    permission_classes = [AllowAny]

    def post(self, request):
        token_str = request.data.get('token')
        if not token_str:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = EmailVerificationToken.objects.get(token=token_str)
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not token.is_valid:
            return Response({'error': 'Token has expired or already been used'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark email as verified
        user = token.user
        user.is_email_verified = True
        user.save()
        
        # Mark token as used
        token.used = True
        token.save()
        
        # Send welcome email
        email_service.send_welcome_email(
            to_email=user.email,
            to_name=user.first_name or user.username
        )
        
        # Return JWT tokens so user can log in immediately after verification
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Email verified successfully!',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })


class ResendVerificationView(APIView):
    """Resend email verification link"""
    permission_classes = [AllowAny]
    throttle_classes = [RegisterThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal whether user exists
            return Response({'message': 'If an account exists, a verification email has been sent.'})
        
        if user.is_email_verified:
            return Response({'message': 'Email is already verified.'})
        
        # Invalidate old tokens
        EmailVerificationToken.objects.filter(user=user, used=False).update(used=True)
        
        # Create new token (24h expiry)
        token = EmailVerificationToken.objects.create(
            user=user,
            expires_at=timezone.now() + timezone.timedelta(hours=24)
        )
        email_service.send_verification_email(
            to_email=user.email,
            token=str(token.token),
            to_name=user.first_name or user.username
        )
        
        return Response({'message': 'Verification email sent.'})

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginThrottle]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_token = f"{uid}/{token}"
            
            email_service.send_password_reset(
                to_email=email,
                reset_token=reset_token,
                to_name=user.first_name or user.username
            )
            
        return Response({"message": "If an account exists with this email, a reset link has been sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['new_password']
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return StandardResponse.success(data=serializer.data, message="Profile retrieved successfully")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return StandardResponse.success(data=serializer.data, message="Profile updated successfully")




class GlobalAdminStatsView(APIView):
    """
    Returns global statistics for the platform admin dashboard.
    Only accessible by staff/superusers.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Lazy imports to avoid Djongo SQL errors at module import time
        from apps.marketplace.models import UsedBikeListing
        from apps.news.models import Article
        from django.db.models import Count

        total_users = User.objects.count()
        verified_users = User.objects.filter(is_email_verified=True).count()

        # Marketplace stats
        active_listings = UsedBikeListing.objects.filter(status='active').count()
        pending_listings = UsedBikeListing.objects.filter(status='pending').count()
        total_listings = UsedBikeListing.objects.count()

        # News stats
        published_news = Article.objects.filter(is_published=True).count()
        draft_news = Article.objects.filter(is_published=False).count()

        # Location breakdown
        location_stats = list(
            UsedBikeListing.objects.values('location').annotate(count=Count('id')).order_by('-count')[:5]
        )

        data = {
            "users": {
                "total": total_users,
                "verified": verified_users,
            },
            "marketplace": {
                "total": total_listings,
                "active": active_listings,
                "pending": pending_listings,
                "locations": location_stats,
            },
            "content": {
                "published_articles": published_news,
                "draft_articles": draft_news,
            },
            "last_updated": timezone.now().isoformat()
        }
        return StandardResponse.success(data=data, message="Admin statistics retrieved successfully")

