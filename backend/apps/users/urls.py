from django.urls import path
from .views import (
    GoogleAuthView, UserProfileView,
    NotificationListView, RegisterView, PasswordResetRequestView,
    PasswordResetConfirmView, UserDashboardStatsView,
    EmailLoginView, EmailVerifyView, ResendVerificationView,
    GlobalAdminStatsView, LogoutView, UserSessionView,
    VerifyOTPView, ProfileDetailView
)
from .admin_views import (
    StaffAdminListView, StaffAdminCreateView, StaffAdminDeleteView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', EmailLoginView.as_view(), name='email-login'),
    path('auth/verify-2fa/', VerifyOTPView.as_view(), name='verify-2fa'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify-email/', EmailVerifyView.as_view(), name='verify-email'),
    path('auth/resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-auth'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/full/', ProfileDetailView.as_view(), name='profile-full'),
    path('me/stats/', UserDashboardStatsView.as_view(), name='user-stats'),
    path('admin/stats/', GlobalAdminStatsView.as_view(), name='admin-stats'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', UserSessionView.as_view(), name='auth-me'),
    
    # Staff Management
    path('admin/staff/', StaffAdminListView.as_view(), name='staff-list'),
    path('admin/staff/create/', StaffAdminCreateView.as_view(), name='staff-create'),
    path('admin/staff/<int:pk>/delete/', StaffAdminDeleteView.as_view(), name='staff-delete'),
]
