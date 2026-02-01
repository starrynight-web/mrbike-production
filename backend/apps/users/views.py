from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache
from django.conf import settings
import secrets
import hmac
import logging

logger = logging.getLogger(__name__)

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

