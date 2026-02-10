from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.throttling import UserRateThrottle
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model
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
    RegisterSerializer
)
from apps.marketplace.models import UsedBikeListing
from apps.interactions.models import Review, Wishlist
from .models import Notification
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

User = get_user_model()
logger = logging.getLogger(__name__)


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
            )
            created = True

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'created': created,
        })

class OTPRateThrottle(UserRateThrottle):
    """Rate limit OTP requests to 3 per minute per phone/IP"""
    scope = 'otp_send'
    rate = '3/min'


class SendOTPView(APIView):
    """
    Sends OTP via Firebase/SMS.
    In production, this would call Firebase Auth or an SMS gateway.
    """
    permission_classes = [AllowAny]
    throttle_classes = [OTPRateThrottle]
    
    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for lockout (too many failed attempts)
        attempts_key = f"otp_attempts_{phone}"
        attempts = cache.get(attempts_key, 0)
        if attempts >= 5:
            logger.warning("OTP request lockout for phone after failed attempts")
            return Response(
                {"error": "Too many failed attempts. Please try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Generate a cryptographically secure 6-digit OTP
        otp = str(secrets.randbelow(900000) + 100000)
        
        # Store OTP in cache for 5 minutes
        cache.set(f"otp_{phone}", otp, timeout=300)
        
        # Log OTP send event (without exposing OTP in production logs)
        logger.debug("OTP sent for phone (masked)")
        
        # Only return OTP in development if DEBUG_OTP flag is explicitly enabled
        response_data = {"message": "OTP sent successfully", "phone": phone}
        if getattr(settings, 'DEBUG_OTP', False):
            response_data["dev_otp"] = otp
        
        return Response(response_data)

class VerifyOTPView(APIView):
    """
    Verifies the OTP provided by the user.
    Implements constant-time comparison and attempt tracking.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        
        if not phone or not otp:
            return Response({"error": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check attempt lockout
        attempts_key = f"otp_attempts_{phone}"
        attempts = cache.get(attempts_key, 0)
        if attempts >= 5:
            logger.warning("OTP verification blocked due to too many attempts for phone")
            return Response(
                {"error": "Too many failed attempts. Please request a new OTP."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        cached_otp = cache.get(f"otp_{phone}")
        
        # Master OTP for development/demo (only if DEBUG is True)
        is_demo = False
        is_admin_debug = False
        
        if settings.DEBUG and otp == "123456":
            if phone == "01711111111":
                is_demo = True
                logger.info("Demo login attempt with master OTP detected")
            elif phone == "01999999999":
                is_admin_debug = True
                logger.info("Admin debug login attempt with master OTP detected")
        
        if is_demo or is_admin_debug or (cached_otp and hmac.compare_digest(cached_otp, otp)):
            # Successful verification: delete OTP and reset attempts
            if not (is_demo or is_admin_debug):
                cache.delete(f"otp_{phone}")
            cache.delete(attempts_key)
            logger.info("OTP verification successful")

            # Find or create user
            user = User.objects.filter(phone=phone).first()
            created = False
            if not user:
                # Generate unique username using phone as identifier
                username = generate_unique_username(phone, User)
                # For phone-only accounts avoid setting a real email address; set email=None
                user = User.objects.create(
                    phone=phone,
                    username=username,
                    email=None,
                    is_phone_verified=True
                )
                created = True
            
            # Ensure demo user is assigned a limited demo role (do NOT grant superuser)
            if is_demo:
                user.is_staff = False
                user.is_superuser = False
                user.role = 'demo'
                user.save()
            
            # For admin debug, ALWAYS ensure they have access and correct role
            if is_admin_debug:
                if not user.is_staff or not user.is_superuser or user.role != 'admin':
                    user.is_staff = True
                    user.is_superuser = True
                    user.role = 'admin'
                    user.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data,
                "created": created,
                "message": "Phone verified successfully"
            })
        
        # Failed attempt: increment counter with 5-min TTL tied to OTP timeout
        cache.set(attempts_key, attempts + 1, timeout=300)
        logger.warning(f"Failed OTP verification attempt {attempts + 1} for phone")
        
        return Response(
            {"success": False, "error": "Invalid or expired OTP"},
            status=status.HTTP_400_BAD_REQUEST
        )


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
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # In production, this would be a link to your frontend reset page
            reset_url = f"{settings.ALLOWED_HOSTS[0]}/reset-password/{uid}/{token}/"
            
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@mrbikebd.com',
                [email],
                fail_silently=False,
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
