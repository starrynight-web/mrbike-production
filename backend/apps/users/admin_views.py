"""
Admin API Views for MrBikeBD
Provides statistics and management endpoints for admin panel
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from apps.bikes.models import BikeModel, Brand
from apps.marketplace.models import UsedBikeListing
from apps.users.models import User
from apps.interactions.models import Review

class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class AdminStatsView(APIView):
    """Get admin dashboard statistics"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Date ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Bike stats
        total_bikes = BikeModel.objects.count()
        active_bikes = BikeModel.objects.filter(is_available=True).count()
        
        # Used bike listings stats
        total_listings = UsedBikeListing.objects.count()
        pending_listings = UsedBikeListing.objects.filter(status='pending').count()
        approved_listings = UsedBikeListing.objects.filter(status='active').count()
        
        # User stats
        total_users = User.objects.count()
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        new_users_month = User.objects.filter(date_joined__gte=month_ago).count()
        
        # Review stats
        total_reviews = Review.objects.count()
        avg_rating = Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Recent activity
        recent_listings = UsedBikeListing.objects.filter(
            created_at__gte=week_ago
        ).count()
        
        return Response({
            'bikes': {
                'total': total_bikes,
                'active': active_bikes,
                'inactive': total_bikes - active_bikes
            },
            'listings': {
                'total': total_listings,
                'pending': pending_listings,
                'approved': approved_listings,
                'rejected': total_listings - pending_listings - approved_listings,
                'recent_week': recent_listings
            },
            'users': {
                'total': total_users,
                'new_week': new_users_week,
                'new_month': new_users_month
            },
            'reviews': {
                'total': total_reviews,
                'average_rating': round(avg_rating, 2)
            },
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)


class AdminFilterOptionsView(APIView):
    """Get filter options for admin panel"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get unique brands
        brands = Brand.objects.all().values('id', 'name', 'slug').order_by('name')
        
        # Get unique categories
        categories = BikeModel.objects.values_list('category', flat=True).distinct()
        
        return Response({
            'brands': list(brands),
            'categories': [cat for cat in categories if cat],
            'listing_statuses': ['pending', 'active', 'rejected']
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_listing(request, listing_id):
    """Approve a used bike listing"""
    try:
        listing = UsedBikeListing.objects.get(id=listing_id)
        listing.status = 'active'
        listing.reviewed_at = timezone.now()
        listing.reviewed_by = request.user
        listing.save()
        
        return Response({
            'message': 'Listing approved successfully',
            'listing_id': listing_id
        }, status=status.HTTP_200_OK)
    except UsedBikeListing.DoesNotExist:
        return Response({
            'error': 'Listing not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_listing(request, listing_id):
    """Reject a used bike listing"""
    rejection_reason = request.data.get('reason', 'No reason provided')
    
    try:
        listing = UsedBikeListing.objects.get(id=listing_id)
        listing.status = 'rejected'
        listing.rejection_reason = rejection_reason
        listing.reviewed_at = timezone.now()
        listing.reviewed_by = request.user
        listing.save()
        
        return Response({
            'message': 'Listing rejected successfully',
            'listing_id': listing_id
        }, status=status.HTTP_200_OK)
    except UsedBikeListing.DoesNotExist:
        return Response({
            'error': 'Listing not found'
        }, status=status.HTTP_404_NOT_FOUND)
