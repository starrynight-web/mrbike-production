from .base import *
from .startup_checks import check_env_vars
import os
from django.core.exceptions import ImproperlyConfigured

DEBUG = False

# Enforce environment variable checks
check_env_vars(debug=False)

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY must be set in production.")

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "mrbikebd.com,www.mrbikebd.com,mrbikebd.vercel.app").split(",")
# Add Hugging Face domain wildcard
ALLOWED_HOSTS += [".hf.space"]

# Database setup (Strict PostgreSQL)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ImproperlyConfigured("DATABASE_URL must be set in production.")

import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=0,  # MUST BE 0 for Supavisor/PgBouncer transaction mode to prevent dropped connections
        conn_health_checks=True,
    )
}
DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True

# Fix Supabase connection drops: Do NOT use keepalives with Supavisor pooler as it causes "server closed the connection unexpectedly"
# DATABASES['default']['OPTIONS'] = {
#     'keepalives': 1,
#     'keepalives_idle': 60,
#     'keepalives_interval': 10,
#     'keepalives_count': 5,
# }

# Redis / Cache Production settings (Enforce SSL)
REDIS_URL = os.getenv("REDIS_URL")
if not REDIS_URL:
    raise ImproperlyConfigured("REDIS_URL must be set in production.")

# Ensure REDIS_URL uses SSL (rediss://)
if not REDIS_URL.startswith("rediss://") and os.getenv("REDIS_SSL", "true").lower() == "true":
    REDIS_URL = REDIS_URL.replace("redis://", "rediss://", 1)

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': REDIS_URL,
    }
}

# Security Settings (Hardened)
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com; img-src 'self' data: https://res.cloudinary.com;"
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Simple JWT Production
SIMPLE_JWT['SIGNING_KEY'] = SECRET_KEY

# Sentry Error Monitoring
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,  # Security: do not send emails, IPs, or cookies to Sentry
    )

# Static files should use WhiteNoise (already in middleware)
# No need for extra config here if base/middleware covers it.
