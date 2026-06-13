from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """Limit login attempts to prevent brute force attacks."""
    scope = 'login'


class OTPRateThrottle(AnonRateThrottle):
    """Limit OTP verification attempts to prevent brute force of 6-digit codes."""
    scope = 'otp'


class ResendVerificationThrottle(AnonRateThrottle):
    """Limit resend verification requests to prevent email flooding."""
    scope = 'resend_verification'


class PasswordResetThrottle(AnonRateThrottle):
    """Limit password reset requests."""
    scope = 'password_reset'
