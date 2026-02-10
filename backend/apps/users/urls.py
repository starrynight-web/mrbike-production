from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/otp/send/', views.SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-phone/', views.VerifyOTPView.as_view(), name='verify-phone'),
    path('auth/google/', views.GoogleAuthView.as_view(), name='google-auth'),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('me/stats/', views.UserDashboardStatsView.as_view(), name='user-stats'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
]
