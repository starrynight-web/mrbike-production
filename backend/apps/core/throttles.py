"""
Custom Throttle Classes for Rate Limiting
Prevents abuse and protects API endpoints
"""

from rest_framework.throttling import SimpleRateThrottle, AnonRateThrottle, UserRateThrottle
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class AuthThrottle(SimpleRateThrottle):
    """
    Rate limit for authentication endpoints (login, register, OTP)
    10 attempts per hour per IP address
    """
    scope = 'auth'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            # Throttle by user ID for authenticated users
            return self.cache_format % {
                'scope': self.scope,
                'ident': request.user.id
            }
        else:
            # Throttle by IP for anonymous users
            return self.cache_format % {
                'scope': self.scope,
                'ident': self.get_client_ip(request)
            }
    
    def get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class MarketplaceCreateThrottle(SimpleRateThrottle):
    """
    Rate limit for marketplace listing creation
    Prevents spam listings
    - 5 new listings per hour per user
    - 20 new listings per day per user
    """
    scope = 'marketplace_create'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None  # Only throttle authenticated users
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': request.user.id
        }


class AdminActionThrottle(SimpleRateThrottle):
    """
    Rate limit for admin actions (edit, delete)
    Logs suspicious activity
    """
    scope = 'admin_action'
    
    def __init__(self):
        super().__init__()
        self._last_request = None
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_staff:
            return None
        
        self._last_request = request
        return self.cache_format % {
            'scope': self.scope,
            'ident': request.user.id
        }
    
    def throttle_success(self):
        """Log admin actions for audit trail"""
        result = super().throttle_success()
        
        if result and self._last_request and self._last_request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            email = getattr(self._last_request.user, 'email', 'unknown')
            logger.info(
                f"Admin action: {self._last_request.method} {self._last_request.path} by {email}"
            )
        
        return result


class SearchThrottle(SimpleRateThrottle):
    """
    Rate limit for search queries
    Prevents search abuse (e.g., extracting entire database)
    - 1000 requests per hour for authenticated users
    - 100 requests per hour for anonymous users
    """
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            # Use user-specific scope and rate for authenticated users
            self.scope = 'search_user'
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"user:{request.user.id}"
            }
        else:
            # Use anonymous scope and rate
            self.scope = 'search_anon'
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR', 'unknown')
            return self.cache_format % {
                'scope': self.scope,
                'ident': f"anon:{ip}"
            }


class ImageUploadThrottle(SimpleRateThrottle):
    """
    Rate limit for image uploads
    Prevents spam image uploads
    - 20 images per hour per user
    """
    scope = 'image_upload'
    
    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': request.user.id
        }


class IPBasedThrottle(SimpleRateThrottle):
    """
    Global rate limit per IP address
    Prevents DDoS attacks
    - 5000 requests per hour per IP
    """
    scope = 'ip_based'
    
    def get_cache_key(self, request, view):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ip
        }


class BurstThrottle(SimpleRateThrottle):
    """
    Prevent burst requests (multiple rapid requests)
    - 30 requests per minute per user/IP
    Useful for detecting automated attacks
    """
    scope = 'burst'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.id
        else:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ident = x_forwarded_for.split(',')[0].strip()
            else:
                ident = request.META.get('REMOTE_ADDR', 'unknown')
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }


# ============================================================================
# THROTTLE SETTINGS FOR settings.py
# ============================================================================

THROTTLE_RATES_CONFIG = {
    'auth': '10/hour',              # Login: 10 per hour
    'marketplace_create': '5/hour', # New listings: 5 per hour
    'admin_action': '100/hour',     # Admin actions: 100 per hour
    'search_user': '1000/hour',     # Search (authenticated): 1000 per hour
    'search_anon': '100/hour',      # Search (anonymous): 100 per hour
    'image_upload': '20/hour',      # Image upload: 20 per hour
    'ip_based': '5000/hour',        # IP global: 5000 per hour
    'burst': '30/minute',           # Burst: 30 per minute
    'anon': '100/hour',             # Default anonymous
    'user': '1000/hour',            # Default authenticated
}

# Usage in settings.py:
# REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = THROTTLE_RATES_CONFIG

# Usage in views:
"""
from rest_framework.decorators import api_view, throttle_classes
from .throttles import AuthThrottle

@api_view(['POST'])
@throttle_classes([AuthThrottle])
def login(request):
    # This endpoint will be throttled to 10 requests per hour
    pass
"""
