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
        except AuthenticationFailed as e:
            # If token is present but invalid, and it's a safe read-only method,
            # just treat as anonymous. For mutating methods, raise the 401 error.
            if request.method in ('GET', 'HEAD', 'OPTIONS'):
                return None
            raise e
