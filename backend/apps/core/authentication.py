from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class LenientJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication that doesn't raise 401 on invalid tokens.
    Instead, it just returns None (anonymous user).
    Useful for public views that still want to track user if possible.
    """
    def authenticate(self, request):
        # We MUST NOT swallow AuthenticationFailed here. 
        # If a token is provided but expired, we must raise 401 so the frontend's api-service interceptor 
        # can catch it and trigger a token refresh via NextAuth.
        # If no token is provided, super().authenticate returns None natively, which is perfectly safe for public views.
        return super().authenticate(request)
