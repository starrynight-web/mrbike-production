from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class LenientJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication that doesn't raise 401 on invalid tokens.
    Instead, it just returns None (anonymous user).
    Useful for public views that still want to track user if possible.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            # If token is present but invalid, just treat as anonymous
            return None
