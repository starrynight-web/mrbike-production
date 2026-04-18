from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from django.db import connections
from django.core.cache import cache

from .models import SiteConfig
from .serializers import SiteConfigSerializer
from .permissions import IsStaffWithRole, IsSuperAdminOnly
from ..bikes.models import BikeModel, Brand
from ..marketplace.models import UsedBikeListing
import cloudinary.uploader
import json

User = get_user_model()

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

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
    permission_classes = [IsAdminUser]

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
    permission_classes = [IsAdminUser]

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
class PublicSiteConfigView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        configs = SiteConfig.objects.all()
        data = {c.key: c.value for c in configs}
        return Response(data)

class AdminSettingsView(APIView):
    """Dynamic site configuration managed by staff_settings."""
    permission_classes = [IsStaffWithRole('staff_settings')]

    def get(self, request):
        configs = SiteConfig.objects.all()
        # Flat dictionary for easier frontend handling
        settings_data = {cfg.key: cfg.value for cfg in configs}
        return Response(settings_data)

    def post(self, request):
        updated_count = 0
        for key, value in request.data.items():
            # If it's a list/dict, store as JSON string
            if isinstance(value, (list, dict)):
                value_str = json.dumps(value)
            else:
                value_str = str(value)

            SiteConfig.objects.update_or_create(
                key=key,
                defaults={'value': value_str, 'updated_by': request.user.email}
            )
            updated_count += 1
        return Response({"message": f"Updated {updated_count} keys successfully."})

class HeroImageUploadView(APIView):
    """Upload hero image directly to Cloudinary and update config."""
    permission_classes = [IsStaffWithRole('staff_settings')]
    
    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=400)
            
        try:
            result = cloudinary.uploader.upload(
                image, 
                folder='mrbikebd/site/',
                transformation=[{'quality': 'auto', 'fetch_format': 'auto'}]
            )
            url = result['secure_url']
            
            SiteConfig.objects.update_or_create(
                key='hero_image',
                defaults={'value': url, 'updated_by': request.user.email}
            )
            return Response({'url': url})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

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
