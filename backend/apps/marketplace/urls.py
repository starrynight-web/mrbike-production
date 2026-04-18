from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsedBikeListingViewSet, ShopViewSet, MembershipPlanViewSet, UserMembershipViewSet
from .payment_views import (
    PendingPaymentsListView, ApproveBoostView, RejectBoostView,
    ApproveMembershipView, RejectMembershipView
)

router = DefaultRouter()
router.register(r'listings', UsedBikeListingViewSet, basename='used-bike-listing')
router.register(r'shops', ShopViewSet, basename='shop')
router.register(r'membership/plans', MembershipPlanViewSet, basename='membership-plan')
router.register(r'membership/signup', UserMembershipViewSet, basename='membership-signup')

urlpatterns = [
    path('', include(router.urls)),
    
    # Payment Administration (Staff Payments Role)
    path('payments/pending/', PendingPaymentsListView.as_view(), name='pending-payments'),
    path('payments/boost/<int:pk>/approve/', ApproveBoostView.as_view(), name='approve-boost'),
    path('payments/boost/<int:pk>/reject/', RejectBoostView.as_view(), name='reject-boost'),
    path('payments/membership/<int:pk>/approve/', ApproveMembershipView.as_view(), name='approve-membership'),
    path('payments/membership/<int:pk>/reject/', RejectMembershipView.as_view(), name='reject-membership'),
]
