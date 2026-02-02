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
import logging

# Google token verification
import google.oauth2.id_token
import google.auth.transport.requests

from .serializers import GoogleAuthSerializer, UserSerializer
from apps.marketplace.models import UsedBikeListing
from apps.interactions.models import Review, Wishlist

User = get_user_model()
logger = logging.getLogger(__name__)


def generate_unique_username(email: str, UserModel, max_attempts: int = 10) -> str:
    """Generate a deterministic, unique username based on the email local part.
    Appends a short deterministic suffix if collision occurs.
    """
    base = email.split('@')[0][:30]
    username = base
    suffix_chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    attempt = 0
    while UserModel.objects.filter(username=username).exists() and attempt < max_attempts:
        # deterministic suffix from email+attempt
        seed = f"{email}-{attempt}"
        suffix = ''.join(secrets.choice(suffix_chars) for _ in range(4))
        username = f"{base}-{suffix}"
        attempt += 1
    if UserModel.objects.filter(username=username).exists():
        # fallback: append timestamp
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
        
        if cached_otp and hmac.compare_digest(cached_otp, otp):
            # Successful verification: delete OTP and reset attempts
            cache.delete(f"otp_{phone}")
            cache.delete(attempts_key)
            logger.info("OTP verification successful")
            return Response({"success": True, "message": "Phone verified successfully"})
        
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

