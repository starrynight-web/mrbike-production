"""
Django settings for core project.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-mrbikebd-secret-key-123456789"
    else:
        from django.core.exceptions import ImproperlyConfigured
        raise ImproperlyConfigured("The SECRET_KEY setting must not be empty in production.")


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    'django_filters',
    
    # Local apps
    'apps.core',
    'apps.users',
    'apps.bikes',
    'apps.marketplace',
    'apps.news',
    'apps.interactions',
    'apps.recommendations',
]

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
        'DIRS': [],
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

# Database Configuration
# Primary: PostgreSQL/Supabase (if DATABASE_URL is set)
# Fallback: Local SQLite for development or when remote DB is unreachable
DATABASE_URL = os.getenv("DATABASE_URL")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

if DATABASE_URL:
    try:
        import dj_database_url
        DATABASES['default'] = dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
        print("[OK] Using PostgreSQL/Supabase database as default")
    except ImportError:
        print("[WARNING] dj-database-url not installed. Falling back to SQLite.")

# MongoDB Settings
MONGODB_URI = os.getenv("MONGODB_URI")
if MONGODB_URI:
    DATABASES['mongodb'] = {
        'ENGINE': 'djongo',
        'NAME': os.getenv("MONGODB_DATABASE", "mrbikebd"),
        'ENFORCE_SCHEMA': False,
        'CLIENT': {
            'host': MONGODB_URI,
        }
    }
    print("[OK] MongoDB configuration added")

# Database Routers
DATABASE_ROUTERS = ['core.db_routers.DatabaseRouter']

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

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# DRF Settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'image_upload': '10/hour',
        'login': '5/min',
        'register': '10/hour',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Simple JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# MongoDB Settings with connection handling
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/mrbikebd")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "mrbikebd")

MONGODB_AVAILABLE = False
if DEBUG:
    try:
        from pymongo import MongoClient
        mongo_test = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        mongo_test.server_info()
        MONGODB_AVAILABLE = True
        print("[OK] MongoDB connection successful")
    except Exception as e:
        print(f"[WARN] MongoDB connection failed: {e}")
        print("  -> MongoDB-dependent features (recommendations) will be limited")

# Redis Settings with SSL handling
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/1")
if os.getenv("REDIS_SSL", "false").lower() == "true":
    if REDIS_URL.startswith("redis://"):
        REDIS_URL = REDIS_URL.replace("redis://", "rediss://", 1)
else:
    if REDIS_URL.startswith("rediss://"):
        REDIS_URL = REDIS_URL.replace("rediss://", "redis://", 1)

# Test Redis connection and configure cache backend
if DEBUG:
    try:
        import redis
        redis_test = redis.from_url(REDIS_URL, socket_connect_timeout=2)
        redis_test.ping()
        CACHES = {
            'default': {
                'BACKEND': 'django.core.cache.backends.redis.RedisCache',
                'LOCATION': REDIS_URL,
            }
        }
        print("[OK] Redis connection successful")
    except Exception as e:
        CACHES = {
            'default': {
                'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            }
        }
        print(f"[WARN] Redis connection failed: {e}")
        print("  -> Using local memory cache (OTP won't persist across restarts)")
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
        }
    }

# Cloudinary Settings
import cloudinary
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

# Validate Cloudinary config at startup
if DEBUG:
    _cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    if not _cloud_name:
        print("[WARN] Cloudinary not configured — image uploads will fail")
    else:
        print(f"[OK] Cloudinary configured (cloud: {_cloud_name})")

# Frontend URL (for email verification links)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Email Configuration (Brevo / Sendinblue SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp-relay.brevo.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('BREVO_SMTP_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('BREVO_API_KEY', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@mrbikebd.com')

# CORS Settings
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        "https://mrbikebd.com",
        "https://www.mrbikebd.com",
    ]
CORS_ALLOW_CREDENTIALS = True

# Developer Convenience
DEBUG_OTP = DEBUG

# Security Settings (Production)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# CSRF & Session Security
CSRF_COOKIE_HTTPONLY = False  # Frontend JS needs to read CSRF token
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = [
    origin if origin.startswith(("http://", "https://")) else f"http://{origin}"
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
]
SECURE_REFERRER_POLICY = 'same-origin'

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'django.log',
            'maxBytes': 1024 * 1024 * 5,  # 5MB
            'backupCount': 3,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.security': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
