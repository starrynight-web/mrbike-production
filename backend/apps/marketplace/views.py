from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets, filters, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.exceptions import PermissionDenied
from apps.core.responses import StandardResponse
from apps.core.permissions import IsSuperAdminOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
import os
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import UsedBikeListing, ReportListing, Shop
from .serializers import (
    UsedBikeListingSerializer, 
    UsedBikeListingCreateSerializer,
    ReportListingSerializer,
    ShopSerializer,
    MembershipPlanSerializer,
    ListingBoostSerializer,
    UserMembershipSerializer,
    ListingBoostAdminSerializer,
    UserMembershipAdminSerializer
)
from .filters import UsedBikeListingFilter
from .models import ListingBoost, UserMembership, MembershipPlan
from apps.core.permissions import IsStaffWithRole
from django.db.models import Count

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Permission to check if user is the seller of the listing.
    Allows read-only access to all, but only sellers can update/delete their own listings.
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user

class IsShopOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all().select_related('owner')
    serializer_class = ShopSerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'location_city', 'location_area']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsShopOwnerOrReadOnly()]
        if self.action in ['create']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        shop, created = Shop.objects.get_or_create(owner=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(shop)
            return Response(serializer.data)
        
        serializer = self.get_serializer(shop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsedBikeListingViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = UsedBikeListingFilter
    search_fields = ['title', 'description', 'location', 'location_city']
    ordering_fields = ['price', 'created_at', 'mileage']
    
    @method_decorator(cache_page(60))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    def get_object(self):
        """Allow getting listing by ID or slug"""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)

        if lookup_value and not str(lookup_value).isdigit():
            self.lookup_field = 'slug'
            self.lookup_url_kwarg = 'pk'

        return super().get_object()

    def get_queryset(self):
        queryset = UsedBikeListing.objects.all().select_related('seller', 'bike_model')
        user = self.request.user
        
        # Priority 1: Admin moderation entries (Super Admin OR Staff with Role)
        if user and user.is_authenticated and self.action in ['list', 'retrieve', 'approve', 'reject']:
            from apps.core.permissions import IsStaffWithRole
            # Check if super admin or has staff_used_bikes role
            if IsStaffWithRole('staff_used_bikes')().has_permission(self.request, self):
                status_param = self.request.query_params.get('status')
                if status_param in ['pending', 'rejected', 'active', 'sold', 'expired']:
                    return queryset.filter(status=status_param).order_by('-created_at')
                elif status_param == 'all' or self.action in ['approve', 'reject']:
                    return queryset.order_by('-created_at')
                
                # Default for moderation view if no status provided
                if self.action in ['list'] and 'admin' in self.request.path:
                     return queryset.filter(status='pending').order_by('-created_at')
                
                return queryset.order_by('-created_at')

        # Priority 2: Public feed (For everyone else, including normal authenticated users)
        queryset = queryset.filter(status='active').select_related('shop', 'bike_model', 'seller')
        return queryset.order_by('-is_featured', '-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsedBikeListingCreateSerializer
        return UsedBikeListingSerializer

    def create(self, request, *args, **kwargs):
        # Enforce limits (Section 4.10)
        user = request.user
        existing_count = UsedBikeListing.objects.filter(seller=user).exclude(status='rejected').count()
        
        limit = 3 # Default free limit
        try:
            # Check for active membership
            if hasattr(user, 'membership') and user.membership.status == 'active':
                limit = user.membership.plan.max_bikes
        except Exception:
            pass
            
        if existing_count >= limit:
            return StandardResponse.error(
                message=f"Listing limit reached. Your current limit is {limit} bikes. Upgrade your membership to post more.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return StandardResponse.success(
                data=serializer.data,
                message="Your listing has been posted successfully and is now under review.",
                status_code=status.HTTP_201_CREATED
            )
        
        return StandardResponse.error(
            message="There were errors in your listing information.",
            errors=serializer.errors
        )

    def perform_create(self, serializer):
        images = self.request.FILES.getlist('uploaded_images')
        serializer.save(
            seller=self.request.user, 
            status='pending',
            uploaded_images=images
        )

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsSellerOrReadOnly()]
        elif self.action in ['approve', 'reject']:
            return [IsStaffWithRole('staff_used_bikes')()]
        return [AllowAny()]

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=401)
        listings = UsedBikeListing.objects.filter(seller=request.user).order_by('-created_at')
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        print(f"DEBUG: Approval triggered for listing ID: {pk}")
        listing = self.get_object()
        
        category = request.data.get('category')
        if category:
            listing.category = category
            
        listing.status = 'active'
        listing.is_verified = True
        listing.reviewed_by = request.user
        listing.reviewed_at = timezone.now()
        listing.save()
        print(f"DEBUG: Listing {pk} saved as active")

        try:
            from apps.users.services.email_service import email_service
            from apps.users.models import Notification
            
            seller = listing.seller
            if seller.email:
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
                listing_url = f"{frontend_url}/used-bike/{listing.slug or str(listing.id)}"
                
                print(f"DEBUG: Sending approval email to {seller.email} (Verified: {seller.is_email_verified})")
                email_sent = email_service.send_approval_email(
                    to_email=seller.email,
                    listing_title=listing.title,
                    listing_url=listing_url,
                    to_name=seller.first_name or seller.username
                )
                print(f"DEBUG: Approval email sent status: {email_sent}")
            else:
                print(f"WARN: Seller {seller.username} has no email address")
            
            Notification.objects.create(
                user=seller,
                title="Listing Approved!",
                message=f'Your listing "{listing.title}" has been approved and is now live!'
            )
        except Exception as e:
            import traceback
            print(f"ERROR: Failed to send approval notification for listing {pk}: {str(e)}")
            traceback.print_exc()
        
        data = {"status": "active", "id": listing.id}
        return StandardResponse.success(data=data, message="Listing has been approved and is now active.")

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        print(f"DEBUG: Rejection triggered for listing ID: {pk}")
        listing = self.get_object()
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {"error": "A rejection reason is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        listing.status = 'rejected'
        listing.rejection_reason = reason
        listing.reviewed_by = request.user
        listing.reviewed_at = timezone.now()
        listing.save()
        print(f"DEBUG: Listing {pk} saved as rejected")
        
        try:
            from apps.users.services.email_service import email_service
            from apps.users.models import Notification
            
            seller = listing.seller
            if seller.email:
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
                dashboard_url = f"{frontend_url}/dashboard/my-listings"
                
                print(f"DEBUG: Sending rejection email to {seller.email} (Verified: {seller.is_email_verified})")
                email_sent = email_service.send_rejection_email(
                    to_email=seller.email,
                    listing_title=listing.title,
                    reason=reason,
                    listing_url=dashboard_url,
                    to_name=seller.first_name or seller.username
                )
                print(f"DEBUG: Rejection email sent status: {email_sent}")
            else:
                print(f"WARN: Seller {seller.username} has no email address")
            
            Notification.objects.create(
                user=seller,
                title="Listing Not Approved",
                message=f'Your listing "{listing.title}" was not approved. Reason: {reason}'
            )
        except Exception as e:
            print(f"ERROR: Failed to send rejection notification for listing {pk}: {str(e)}")
        
        data = {"status": "rejected", "id": listing.id}
        return StandardResponse.success(data=data, message="Listing has been rejected and seller has been notified.")

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None):
        listing = self.get_object()
        serializer = ReportListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(listing=listing, user=request.user)
            return StandardResponse.success(
                data=serializer.data,
                message="Thank you for your report.",
                status_code=status.HTTP_201_CREATED
            )
        return StandardResponse.error(message="Invalid report data.", errors=serializer.errors)

    @action(detail=True, methods=['get'], permission_classes=[IsStaffWithRole('staff_used_bikes')])
    def reports(self, request, pk=None):
        listing = self.get_object()
        reports = listing.reports.all()
        serializer = ReportListingSerializer(reports, many=True)
        return StandardResponse.success(data=serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsStaffWithRole('staff_used_bikes')])
    def reported_all(self, request):
        """View all listings that have been reported."""
        listings = UsedBikeListing.objects.annotate(pc_count=Count('reports')).filter(pc_count__gt=0).order_by('-created_at')
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def boost(self, request, pk=None):
        """Submit a boost request for a listing."""
        listing = self.get_object()
        if listing.seller != request.user:
            raise PermissionDenied("You can only boost your own listings.")

        # Determine price based on membership tier
        amount = 80.00
        try:
            if hasattr(request.user, 'membership') and request.user.membership.status == 'active':
                amount = float(request.user.membership.plan.boost_price)
        except Exception:
            pass

        serializer = ListingBoostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(listing=listing, user=request.user, amount=amount)
            return StandardResponse.success(
                data=serializer.data, 
                message=f"Boost request for {amount} BDT submitted. Waiting for admin approval."
            )
        return StandardResponse.error(message="Invalid boost data.", errors=serializer.errors)

class MembershipPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer
    permission_classes = [AllowAny]

class UserMembershipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMembershipSerializer

    def get_queryset(self):
        return UserMembership.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Only one active/pending membership at a time
        user = request.user
        if UserMembership.objects.filter(user=user, status__in=['pending', 'active']).exists():
            return StandardResponse.error(message="You already have a pending or active membership.")

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            plan = serializer.validated_data['plan']
            serializer.save(user=user, amount_paid=plan.price, status='pending')
            return StandardResponse.success(data=serializer.data, message="Membership request submitted successfully.")
        return StandardResponse.error(message="Invalid membership data.", errors=serializer.errors)

class PaymentManagementViewSet(viewsets.ViewSet):
    """Admin viewset for managing pending boost and membership payments."""
    permission_classes = [IsStaffWithRole('staff_settings')] # Or staff_finance if we had it

    @action(detail=False, methods=['get'])
    def pending(self, request):
        pending_boosts = ListingBoost.objects.filter(status='pending').select_related('listing', 'user')
        pending_memberships = UserMembership.objects.filter(status='pending').select_related('user', 'plan')
        
        return Response({
            "boosts": ListingBoostAdminSerializer(pending_boosts, many=True).data,
            "memberships": UserMembershipAdminSerializer(pending_memberships, many=True).data
        })

    @action(detail=True, methods=['post'], url_path='boost/(?P<id>[^/.]+)/approve')
    def approve_boost(self, request, pk=None):
        boost = ListingBoost.objects.get(id=pk)
        boost.status = 'approved'
        boost.reviewed_by = request.user.email
        boost.reviewed_at = timezone.now()
        boost.valid_until = timezone.now() + timezone.timedelta(days=15)
        boost.save()
        
        # Link to listing
        listing = boost.listing
        listing.active_boost = boost
        listing.is_featured = True
        listing.save()
        
        return Response({"status": "approved"})

    @action(detail=True, methods=['post'], url_path='boost/(?P<id>[^/.]+)/reject')
    def reject_boost(self, request, pk=None):
        boost = ListingBoost.objects.get(id=pk)
        boost.status = 'rejected'
        boost.reviewed_by = request.user.email
        boost.reviewed_at = timezone.now()
        boost.save()
        return Response({"status": "rejected"})

    @action(detail=True, methods=['post'], url_path='membership/(?P<id>[^/.]+)/approve')
    def approve_membership(self, request, pk=None):
        membership = UserMembership.objects.get(id=pk)
        membership.status = 'active'
        membership.reviewed_by = request.user.email
        membership.reviewed_at = timezone.now()
        membership.starts_at = timezone.now()
        membership.expires_at = timezone.now() + timezone.timedelta(days=30)
        membership.save()
        
        # Linked shop verification
        try:
            shop = membership.user.shop
            shop.is_verified = True
            shop.save()
        except Exception:
            pass
            
        return Response({"status": "active"})

    @action(detail=True, methods=['post'], url_path='membership/(?P<id>[^/.]+)/reject')
    def reject_membership(self, request, pk=None):
        membership = UserMembership.objects.get(id=pk)
        membership.status = 'rejected'
        membership.reviewed_by = request.user.email
        membership.reviewed_at = timezone.now()
        membership.save()
        return Response({"status": "rejected"})
