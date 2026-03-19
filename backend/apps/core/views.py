from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from apps.core.permissions import IsSuperAdminOnly
from django.db import connections
from django.core.cache import cache
from django.contrib.auth import get_user_model
from apps.bikes.models import Brand, BikeModel
from apps.marketplace.models import UsedBikeListing
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from django.http import JsonResponse
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

def handler404(request, exception=None):
    """Custom 404 handler for JSON responses"""
    return JsonResponse({
        'status': 'error',
        'message': 'The requested resource was not found.',
        'code': 404
    }, status=404)

def handler500(request):
    """Custom 500 handler for JSON responses"""
    # Log the full error to help debugging
    logger.error("Internal Server Error: %s", request.path, exc_info=True)
    return JsonResponse({
        'status': 'error',
        'message': 'An internal server error occurred. Our team has been notified.',
        'code': 500
    }, status=500)

class AdminStatsView(APIView):
    permission_classes = [IsSuperAdminOnly]

    def get(self, request):
        stats = {
            "total_users": User.objects.count(),
            "total_bikes": BikeModel.objects.count(),
            "total_used_bikes": UsedBikeListing.objects.count(),
            "active_listings": UsedBikeListing.objects.filter(status='active').count(),
            "pending_approvals": UsedBikeListing.objects.filter(status='pending').count(),
            "monthly_traffic": 1250, # Mocked for now
            "user_change": 12.5,     # Mocked percentage
            "bikes_change": 5.2,
            "listings_change": -2.1,
            "traffic_change": 8.4,
        }
        return Response(stats)

class AdminFilterOptionsView(APIView):
    permission_classes = [IsSuperAdminOnly]

    def get(self, request):
        brands = Brand.objects.values('id', 'name')
        categories = BikeModel.objects.values_list('category', flat=True).distinct()
        locations = UsedBikeListing.objects.values_list('location', flat=True).distinct()
        
        return Response({
            "brands": list(brands),
            "categories": list(categories),
            "locations": [loc for loc in locations if loc]
        })

class AdminAnalyticsView(APIView):
    permission_classes = [IsSuperAdminOnly]

    def get(self, request):
        # Basic mock data for analytics that the frontend might expect
        # In a real app, this would query a dedicated Analytics model or aggregate logs
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        from django.db.models.functions import TruncDate
        daily_listings = UsedBikeListing.objects.filter(
            created_at__gte=seven_days_ago
        ).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id')).order_by('day')
        
        return Response({
            "listings_over_time": list(daily_listings),
            "user_growth": [] # Mocked for now
        })
class AdminSettingsView(APIView):
    permission_classes = [IsSuperAdminOnly]

    def get(self, request):
        # Default settings - in production these would be in a DB
        settings_data = {
            "site_name": "MrBikeBD",
            "site_description": "The largest motorcycle marketplace in Bangladesh.",
            "contact_email": "support@mrbikebd.com",
            "contact_phone": "+880 123456789",
            "maintenance_mode": False,
            "enable_registration": True,
            "require_email_verification": True,
            "max_listing_images": 10,
            "listing_expiry_days": 90,
        }
        return Response(settings_data)

    def patch(self, request):
        # Update settings logic here
        return Response({"message": "Settings updated successfully"})

class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        health = {"status": "ok", "checks": {}}
        
        # Check DB
        try:
            connections['default'].cursor()
            health["checks"]["database"] = "ok"
        except Exception as e:
            health["status"] = "error"
            health["checks"]["database"] = str(e)
            
        # Check Redis
        try:
            cache.set("health_check_key", "ok", 1)
            if cache.get("health_check_key") == "ok":
                health["checks"]["cache"] = "ok"
            else:
                raise Exception("Cache retrieval failed")
        except Exception as e:
            health["checks"]["cache"] = str(e)
            
        return Response(health)
