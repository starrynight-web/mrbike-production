import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dummy-key-for-build-purposes-only')

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'django_filters',
    'cloudinary_storage',
    'cloudinary',
    
    # Local apps
    'apps.core',
    'apps.users',
    'apps.bikes',
    'apps.marketplace',
    'apps.news',
    'apps.interactions',
    'apps.recommendations',
    'django_q',
]

# Django-Q Cluster Configuration
Q_CLUSTER = {
    'name': 'mrbikebd_q',
    'workers': 4,
    'recycle': 500,
    'timeout': 60,
    'retry': 120,
    'redis': os.getenv('REDIS_URL', 'redis://localhost:6379/1'),
    'sync': False, # Set to True for synchronous dev testing
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# File upload size limits (H2 FIX)
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024   # 50MB max request body
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024   # 50MB max in-memory file size

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# DRF Settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '2000/day',
        'user': '10000/day',
        'login': '5/minute',              # Max 5 login attempts/minute per IP
        'otp': '3/minute',                # Max 3 OTP attempts/minute (prevents brute force of 6-digit codes)
        'resend_verification': '3/hour',  # Max 3 resend verification emails/hour
        'password_reset': '3/hour',       # Max 3 password reset requests/hour
    },
}

# Simple JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Reduced from 60 — shorter window limits token theft impact
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Cloudinary Settings
import cloudinary
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
SENTRY_DSN = os.getenv("SENTRY_DSN")

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1 if os.getenv('DJANGO_ENV') == 'production' else 0.0,
        send_default_pii=False,  # Security: do not send emails, IPs, or cookies to Sentry
    )

if CLOUDINARY_CLOUD_NAME:
    cloudinary.config(
        cloud_name = CLOUDINARY_CLOUD_NAME,
        api_key = CLOUDINARY_API_KEY,
        api_secret = CLOUDINARY_API_SECRET,
        secure = True
    )
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# Email Configuration (Brevo / Sendinblue SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp-relay.brevo.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_TIMEOUT = 10  # Prevents hanging when SMTP connection silently drops
EMAIL_HOST_USER = os.getenv('BREVO_SMTP_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('BREVO_API_KEY', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@mrbikebd.com')

# Frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# CORS Settings — Production origins only.
# Localhost origins are added in development.py to keep them out of production.
CORS_ALLOWED_ORIGINS = [
    "https://mrbikebd.vercel.app",
    "https://mrbikebd.com",
    "https://www.mrbikebd.com",
]

VERCEL_URL = os.getenv("VERCEL_URL")
if VERCEL_URL:
    CORS_ALLOWED_ORIGINS.append(f"https://{VERCEL_URL}")

CORS_ALLOW_CREDENTIALS = True

# CSRF & Session Security
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = [
    origin if origin.startswith(("http://", "https://")) else f"https://{origin}"
    for origin in CORS_ALLOWED_ORIGINS
]
SECURE_REFERRER_POLICY = 'same-origin'

# Scheduled Tasks (Section 4.10)
# These would typically be set up in the database via Django Admin/Django-Q interface, 
# but documented here for the auditor.
# 1. marketplace.tasks.check_listing_expiry (Frequency: @daily)
# 2. marketplace.tasks.notify_approaching_expiry (Frequency: @daily)

import logging

class IgnoreUnauthorizedFilter(logging.Filter):
    def filter(self, record):
        if record.levelname == 'WARNING' and 'Unauthorized:' in record.getMessage():
            return False
        return True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'ignore_unauthorized': {
            '()': 'core.settings.base.IgnoreUnauthorizedFilter',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'filters': ['ignore_unauthorized'],
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
