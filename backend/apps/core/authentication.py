from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class LenientJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication that truly doesn't raise 401 on invalid/expired tokens.
    Instead, it returns None (anonymous user), allowing public views (AllowAny)
    to still serve data even when a bad or expired token is present.

    WHY THIS MATTERS IN PRODUCTION:
    When a logged-in user's access token expires (15 min lifetime), the next
    request sends that expired token. The standard JWTAuthentication raises
    AuthenticationFailed, which DRF converts to a 401 BEFORE permission checks
    run — so even AllowAny endpoints like GET /bikes/ return 401.
    This causes the "Oops!" error on the public bike catalogue for logged-in users
    with expired tokens.

    HOW IT WORKS:
    - If token is valid → authenticates the user normally (request.user = User)
    - If token is invalid/expired → returns None (request.user = AnonymousUser)
      → AllowAny views serve public data as normal
      → IsAuthenticated views return 403 Forbidden (DRF handles this correctly)

    TOKEN REFRESH:
    NextAuth proactively refreshes tokens client-side via the jwt callback
    (14-minute check vs 15-minute backend lifetime). This class is a safety net
    for the gap between expiry and refresh, not a replacement for refresh logic.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            # Swallow the exception — return None so the request continues
            # as anonymous. AllowAny views will serve public data normally.
            # IsAuthenticated views will still reject via permission checks.
            return None

