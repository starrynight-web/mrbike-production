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
from .models import User, StaffAdmin
from apps.interactions.models import Review
from apps.core.permissions import IsSuperAdminOnly, IsAnyStaffOrSuperAdmin
from apps.core.responses import StandardResponse


class AdminStatsView(APIView):
    """Get admin dashboard statistics"""
    permission_classes = [IsAnyStaffOrSuperAdmin]
    
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
    permission_classes = [IsAnyStaffOrSuperAdmin]
    
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
@permission_classes([IsSuperAdminOnly])
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
@permission_classes([IsSuperAdminOnly])
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

class StaffAdminListView(APIView):
    """List all staff managed by the super admin."""
    permission_classes = [IsSuperAdminOnly]

    def get(self, request):
        staff = StaffAdmin.objects.select_related('user').all()
        data = [{
            'id': s.id,
            'email': s.user.email,
            'sections': s.sections,
            'is_active': s.is_active,
            'created_at': s.created_at
        } for s in staff]
        return Response(data)

class StaffAdminCreateView(APIView):
    """Create or update a staff admin assignment."""
    permission_classes = [IsSuperAdminOnly]

    def post(self, request):
        email = request.data.get('email')
        sections = request.data.get('sections')
        
        # Backward compatibility
        if not sections and request.data.get('role_key'):
            sections = [request.data.get('role_key')]
        
        if not email or not sections or not isinstance(sections, list):
            return Response({'error': 'Email and sections array required'}, status=400)
            
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': email.split('@')[0], 'is_email_verified': True}
        )
        if created:
            user.set_unusable_password() # They should login via social or reset
            user.save()

        # Sync user.role and is_staff for consistency
        user.role = sections[0] if sections else 'user'
        user.is_staff = True
        user.save()

        staff, s_created = StaffAdmin.objects.update_or_create(
            user=user,
            defaults={
                'sections': sections,
                'assigned_by_email': request.user.email,
                'is_active': True
            }
        )
        
        return Response({
            'message': 'Staff assigned successfully',
            'created': s_created,
            'email': email,
            'sections': sections
        })

class StaffAdminDeleteView(APIView):
    """Remove staff admin privileges."""
    permission_classes = [IsSuperAdminOnly]

    def delete(self, request, pk):
        try:
            staff = StaffAdmin.objects.get(pk=pk)
            # Reset user role to 'user' if they were just staff
            user = staff.user
            user.role = 'user'
            user.is_staff = False
            user.save()
            
            staff.delete()
            return Response({'message': 'Staff removed successfully'})
        except StaffAdmin.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class StaffAdminUpdateView(APIView):
    """Update a staff admin assignment (sections or active status)."""
    permission_classes = [IsSuperAdminOnly]

    def patch(self, request, pk):
        try:
            staff = StaffAdmin.objects.get(pk=pk)
            sections = request.data.get('sections')
            is_active = request.data.get('is_active')
            
            if sections is not None:
                if not isinstance(sections, list):
                    return Response({'error': 'Sections must be a list'}, status=400)
                staff.sections = sections
                staff.user.role = sections[0] if sections else 'user'
                staff.user.save()
                
            if is_active is not None:
                staff.is_active = bool(is_active)
                staff.user.is_staff = bool(is_active)
                staff.user.save()
                
            staff.save()
            return Response({
                'message': 'Staff updated successfully',
                'id': staff.id,
                'sections': staff.sections,
                'is_active': staff.is_active
            })
        except StaffAdmin.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class TotalUsersView(APIView):
    """Get total users stats for Super Admin only."""
    permission_classes = [IsSuperAdminOnly]
    
    def get(self, request):
        total_users = User.objects.count()
        new_today = User.objects.filter(date_joined__date=timezone.now().date()).count()
        new_week = User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=7)).count()
        return StandardResponse.success(data={
            "total": total_users,
            "new_today": new_today,
            "new_week": new_week
        }, message="Total users retrieved successfully")
