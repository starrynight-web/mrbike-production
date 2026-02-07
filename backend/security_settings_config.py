"""
Django Settings - Security Hardening Configuration
Add these settings to backend/core/settings.py for production security
"""

import os

# ============================================================================
# SECURITY: HTTPS & SSL
# ============================================================================

# Force HTTPS in production
# Note: DEBUG and SECRET_KEY should be imported from the main settings module
# Assuming this file is imported in settings.py after DEBUG is defined
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_CONTENT_SECURITY_POLICY = {
        'default-src': ("'self'",),
        'script-src': ("'self'", "'unsafe-inline'", "cdn.jsdelivr.net"),
        'style-src': ("'self'", "'unsafe-inline'", "fonts.googleapis.com"),
        'img-src': ("'self'", "data:", "https:", "res.cloudinary.com"),
        'font-src': ("'self'", "data:", "fonts.gstatic.com"),
        'connect-src': ("'self'", "https://api.cloudinary.com"),
        'frame-ancestors': ("'none'",),
    }
    HSTS_SECONDS = 31536000  # 1 year
    HSTS_INCLUDE_SUBDOMAINS = True
    HSTS_PRELOAD = True
    SECURE_HSTS_SECONDS = 31536000


# ============================================================================
# CORS: Whitelist specific origins instead of allowing all
# ============================================================================

CORS_ALLOWED_ORIGINS = (
    [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    if DEBUG
    else [
        "https://mrbikebd.com",
        "https://www.mrbikebd.com",
        "https://admin.mrbikebd.com",
    ]
)

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-forwarded-for',
]
CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-total-count',
    'x-page-count',
]


# ============================================================================
# AUTHENTICATION: JWT + Session
# ============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    
    # Rate Limiting (Throttling)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'apps.core.throttles.AuthThrottle',  # Custom
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',           # Anonymous users: 100 requests/hour
        'user': '1000/hour',          # Authenticated users: 1000 requests/hour
        'auth': '10/hour',            # Login attempts: 10/hour
    },
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),      # Short-lived
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),        # Refresh valid for 7 days
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}


# ============================================================================
# INPUT VALIDATION: Strict validation settings
# ============================================================================

# Passwords must be:
# - At least 12 characters
# - Not a common password
# - Not all digits
# - Not similar to username/email
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,  # Increased from 8
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ============================================================================
# CSRF: CSRF Token Configuration
# ============================================================================

CSRF_COOKIE_HTTPONLY = True      # Prevent JavaScript access
CSRF_COOKIE_SECURE = not DEBUG    # Only send over HTTPS in production
CSRF_COOKIE_AGE = 31449600        # 1 year
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS if isinstance(CORS_ALLOWED_ORIGINS, list) else list(CORS_ALLOWED_ORIGINS)


# ============================================================================
# SESSION: Secure session configuration
# ============================================================================

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_EXPIRE_AT_BROWSER_CLOSE = True


# ============================================================================
# FILE UPLOAD: Restrict file types and sizes
# ============================================================================

# Max file upload size: 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB

# Allowed image formats for used bikes
ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
MAX_IMAGE_SIZE_MB = 5  # 5MB per image

# File upload handlers - custom validation
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755


# ============================================================================
# LOGGING: Security event logging
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'security': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/security.log',
            'maxBytes': 1024 * 1024 * 10,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['security'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}


# ============================================================================
# SECURITY HEADERS: Additional protection
# ============================================================================

# Prevent clickjacking
X_FRAME_OPTIONS = 'DENY'

# Content Security Policy (prevent injection attacks)
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "https:", "res.cloudinary.com")
CSP_FONT_SRC = ("'self'", "data:", "fonts.gstatic.com")

# Prevent MIME type sniffing
SECURE_CONTENT_TYPE_NOSNIFF = True

# XSS Protection
SECURE_BROWSER_XSS_FILTER = True


# ============================================================================
# ADMIN: Secure admin configuration
# ============================================================================

# Use dedicated environment variable for admin URL obscuring token (safer than SECRET_KEY)
ADMIN_URL_TOKEN = os.environ.get('ADMIN_URL_TOKEN', 'admin-panel')
ADMIN_URL = f'django-admin-{ADMIN_URL_TOKEN}/'
ADMIN_SITE_HEADER = 'MrBikeBD Admin'
ADMIN_SITE_TITLE = 'MrBikeBD'

# Important: Set ADMIN_URL_TOKEN environment variable in production
# Example: export ADMIN_URL_TOKEN="your-custom-secure-token"


# ============================================================================
# CLOUDINARY: For image hosting (optional but recommended)
# ============================================================================

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME', ''),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY', ''),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET', ''),
}

# Use Cloudinary for media storage
if CLOUDINARY_STORAGE['CLOUD_NAME']:
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    MEDIA_URL = '/media/'


print("✓ Security settings loaded successfully")
