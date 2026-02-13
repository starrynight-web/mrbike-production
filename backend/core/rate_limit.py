"""
Rate limiting middleware and decorators for MrBikeBD
Protects against DDoS attacks, especially for recommendation endpoints
"""
from django.core.cache import cache
from django.http import JsonResponse
from rest_framework import status
import time
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """
    Middleware to implement rate limiting across the application
    Uses Redis/cache backend to track request counts
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Rate limit configurations (requests per minute)
        self.rate_limits = {
            '/api/recommendations/': 10,  # Max 10 recommendation requests per minute
            '/api/marketplace/': 30,      # Max 30 marketplace requests per minute
            '/api/bikes/': 60,            # Max 60 bike catalog requests per minute
        }
    
    def __call__(self, request):
        # Check if path should be rate limited
        client_ip = self.get_client_ip(request)
        path = request.path
        
        for pattern, limit in self.rate_limits.items():
            if path.startswith(pattern):
                if not self.check_rate_limit(client_ip, pattern, limit):
                    logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
                    return JsonResponse({
                        'error': 'Rate limit exceeded. Please try again later.',
                        'retry_after': 60
                    }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def check_rate_limit(self, client_ip, endpoint, limit):
        """
        Check if client has exceeded rate limit
        
        Args:
            client_ip: Client IP address
            endpoint: API endpoint pattern
            limit: Maximum requests per minute
        
        Returns:
            bool: True if within limit, False if exceeded
        """
        cache_key = f"rate_limit:{endpoint}:{client_ip}"
        
        # Get current count
        current_count = cache.get(cache_key, 0)
        
        if current_count >= limit:
            return False
        
        # Increment count
        if current_count == 0:
            # First request in this window, set expiry to 60 seconds
            cache.set(cache_key, 1, timeout=60)
        else:
            # Increment existing count
            cache.incr(cache_key)
        
        return True


def rate_limit(requests_per_minute=10):
    """
    Decorator for view-level rate limiting
    
    Usage:
        @rate_limit(requests_per_minute=5)
        def my_view(request):
            ...
    """
    def decorator(view_func):
        def wrapped_view(request, *args, **kwargs):
            client_ip = get_client_ip(request)
            cache_key = f"rate_limit:view:{view_func.__name__}:{client_ip}"
            
            current_count = cache.get(cache_key, 0)
            
            if current_count >= requests_per_minute:
                logger.warning(
                    f"Rate limit exceeded for {client_ip} on {view_func.__name__}"
                )
                return JsonResponse({
                    'error': 'Too many requests. Please try again later.',
                    'retry_after': 60
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Increment count
            if current_count == 0:
                cache.set(cache_key, 1, timeout=60)
            else:
                cache.incr(cache_key)
            
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator


def get_client_ip(request):
    """Helper function to extract client IP"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
