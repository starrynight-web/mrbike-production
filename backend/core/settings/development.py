from .base import *
import os

DEBUG = True

SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-mrbikebd-development-key-@@@")

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# SQLite fallback for development if DATABASE_URL is missing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    import dj_database_url
    DATABASES['default'] = dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=0,  # Disable connection persistence for development to avoid staleness
        conn_health_checks=True,
    )
    print("[OK] Development: Using PostgreSQL/Supabase")
else:
    print("[INFO] Development: Using local SQLite")

# Redis / Cache Development settings
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/1")
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
    print("[OK] Development: Redis connection successful")
except Exception:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
    print("[WARN] Development: Redis connection failed, using LocMemCache")

# Simple JWT Debug
SIMPLE_JWT['SIGNING_KEY'] = SECRET_KEY

# Effectively disable throttling by setting very high rates
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = [
    'rest_framework.throttling.AnonRateThrottle',
    'rest_framework.throttling.UserRateThrottle',
]
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100000/hour',
    'user': '100000/hour',
    'image_upload': '100000/hour',
    'login': '100000/hour',
    'register': '100000/hour',
    'email_throttle': '100000/hour',
    'inquiry': '100000/hour',
    'auth': '100000/hour',
    'marketplace_create': '100000/hour',
    'admin_action': '100000/hour',
    'search': '100000/hour',
    'ip_based': '100000/hour',
    'burst': '100000/hour',
}



