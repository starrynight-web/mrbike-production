from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
import random

class SendOTPView(APIView):
    """
    Simulates sending OTP via Firebase/SMS.
    In production, this would call Firebase Auth or an SMS gateway.
    """
    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({"error": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP in cache for 5 minutes
        cache.set(f"otp_{phone}", otp, timeout=300)
        
        # For development/mock, we return the OTP in the response
        # In production, DO NOT return the OTP here!
        print(f"DEBUG: Sent OTP {otp} to {phone}")
        
        return Response({
            "message": "OTP sent successfully",
            "phone": phone,
            "dev_otp": otp # Remove in production
        })

class VerifyOTPView(APIView):
    """
    Verifies the OTP provided by the user.
    """
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        
        if not phone or not otp:
            return Response({"error": "Phone and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        cached_otp = cache.get(f"otp_{phone}")
        
        if cached_otp and cached_otp == otp:
            # Mark phone as verified in session or return a token
            # In a real app, you might link this to the user profile
            return Response({"success": True, "message": "Phone verified successfully"})
        
        return Response({"success": False, "error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
