from django.urls import path
from .views import (
    GoogleAuthView, UserProfileView,
    NotificationListView, RegisterView, PasswordResetRequestView,
    PasswordResetConfirmView, UserDashboardStatsView,
    EmailLoginView, EmailVerifyView, ResendVerificationView,
    GlobalAdminStatsView, LogoutView, UserSessionView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', EmailLoginView.as_view(), name='email-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify-email/', EmailVerifyView.as_view(), name='verify-email'),
    path('auth/resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('auth/google/', GoogleAuthView.as_view(), name='google-auth'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('me/stats/', UserDashboardStatsView.as_view(), name='user-stats'),
    path('admin/stats/', GlobalAdminStatsView.as_view(), name='admin-stats'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', UserSessionView.as_view(), name='auth-me'),
]
