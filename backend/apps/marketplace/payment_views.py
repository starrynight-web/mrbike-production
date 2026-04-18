from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import ListingBoost, UserMembership, UsedBikeListing
from .serializers import ListingBoostSerializer, UserMembershipSerializer
from apps.core.permissions import IsStaffWithRole, IsSuperAdminOnly
from apps.core.responses import StandardResponse

class PendingPaymentsListView(APIView):
    """List all pending boost and membership payments."""
    permission_classes = [IsStaffWithRole('staff_payments')]

    def get(self, request):
        pending_boosts = ListingBoost.objects.filter(status='pending').order_by('-created_at')
        pending_memberships = UserMembership.objects.filter(status='pending').order_by('-created_at')
        
        return Response({
            'boosts': ListingBoostSerializer(pending_boosts, many=True).data,
            'memberships': UserMembershipSerializer(pending_memberships, many=True).data
        })

class ApproveBoostView(APIView):
    """Approve a listing boost."""
    permission_classes = [IsStaffWithRole('staff_payments')]

    def post(self, request, pk):
        try:
            boost = ListingBoost.objects.get(pk=pk)
            if boost.status != 'pending':
                return Response({'error': 'Boost already processed'}, status=400)
            
            # Approve boost
            boost.status = 'approved'
            boost.valid_until = timezone.now() + timezone.timedelta(days=15)
            boost.reviewed_by = request.user.email
            boost.reviewed_at = timezone.now()
            boost.save()
            
            # Update listing
            listing = boost.listing
            listing.active_boost = boost
            listing.is_featured = True # Ensure featured is synced
            listing.save()
            
            return StandardResponse.success(message="Listing boost approved successfully.")
        except ListingBoost.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class RejectBoostView(APIView):
    """Reject a listing boost."""
    permission_classes = [IsStaffWithRole('staff_payments')]

    def post(self, request, pk):
        reason = request.data.get('reason', 'Payment verification failed')
        try:
            boost = ListingBoost.objects.get(pk=pk)
            boost.status = 'rejected'
            boost.reviewed_by = request.user.email
            boost.reviewed_at = timezone.now()
            boost.save()
            return StandardResponse.success(message="Listing boost rejected.")
        except ListingBoost.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class ApproveMembershipView(APIView):
    """Approve a user membership."""
    permission_classes = [IsStaffWithRole('staff_payments')]

    def post(self, request, pk):
        try:
            membership = UserMembership.objects.get(pk=pk)
            if membership.status != 'pending':
                return Response({'error': 'Membership already processed'}, status=400)
            
            membership.status = 'active'
            membership.starts_at = timezone.now()
            membership.expires_at = timezone.now() + timezone.timedelta(days=365) # 1 year
            membership.reviewed_by = request.user.email
            membership.reviewed_at = timezone.now()
            membership.save()
            
            # Update user profile role if necessary
            user = membership.user
            user.role = f"staff_{membership.plan.name}" # Or just keep track via membership profile
            # Actually, per requirements, memberships don't grant staff perms, just listing limits.
            # So we don't change user.role here unless explicitly requested.
            
            return StandardResponse.success(message="Membership approved successfully.")
        except UserMembership.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class RejectMembershipView(APIView):
    permission_classes = [IsStaffWithRole('staff_payments')]

    def post(self, request, pk):
        try:
            membership = UserMembership.objects.get(pk=pk)
            membership.status = 'rejected'
            membership.reviewed_by = request.user.email
            membership.reviewed_at = timezone.now()
            membership.save()
            return StandardResponse.success(message="Membership rejected.")
        except UserMembership.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
