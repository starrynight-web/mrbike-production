from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from apps.bikes.models import Brand, BikeModel
from apps.marketplace.models import UsedBikeListing
from django.db.models import Count, Sum, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = {
            "total_users": User.objects.count(),
            "total_bikes": BikeModel.objects.count(),
            "total_used_bikes": UsedBikeListing.objects.count(),
            "pending_listings": UsedBikeListing.objects.filter(status='pending').count(),
            # Add more stats as needed by frontend
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
        
        daily_listings = UsedBikeListing.objects.filter(
            created_at__gte=seven_days_ago
        ).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id')).order_by('day')
        
        return Response({
            "listings_over_time": list(daily_listings),
            "user_growth": [] # Mocked for now
        })
