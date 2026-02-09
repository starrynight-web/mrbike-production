from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from apps.bikes.models import Brand, BikeModel
from apps.marketplace.models import UsedBikeListing
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        last_month = now - timedelta(days=30)
        
        # Current counts
        total_users = User.objects.count()
        total_bikes = BikeModel.objects.count()
        active_listings = UsedBikeListing.objects.filter(status='active').count()
        pending_listings = UsedBikeListing.objects.filter(status='pending').count()
        
        # Last month counts (approximation for change calculation)
        users_last_month = User.objects.filter(date_joined__lte=last_month).count()
        bikes_last_month = BikeModel.objects.filter(created_at__lte=last_month).count()
        listings_last_month = UsedBikeListing.objects.filter(created_at__lte=last_month, status='active').count()
        
        # Calculate percentage changes
        def calculate_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return int(((current - previous) / previous) * 100)

        stats = {
            "total_users": total_users,
            "total_bikes": total_bikes,
            "active_listings": active_listings,
            "pending_approvals": pending_listings,
            "monthly_traffic": 15420, # Mock data for now
            "pending_listings": pending_listings, # Keep for backward compatibility if any
            
            # Changes
            "user_change": calculate_change(total_users, users_last_month),
            "bikes_change": calculate_change(total_bikes, bikes_last_month),
            "listings_change": calculate_change(active_listings, listings_last_month),
            "traffic_change": 12, # Mock data
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
        ).extra(select={'day': "date(created_at)"}).values('day').annotate(count=Count('id')).order_by('day')
        
        return Response({
            "listings_over_time": list(daily_listings),
            "user_growth": [] # Mocked for now
        })
