from django.urls import path
from . import views

urlpatterns = [
    path('auth/otp/send/', views.SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-phone/', views.VerifyOTPView.as_view(), name='verify-phone'),
    path('auth/google/', views.GoogleAuthView.as_view(), name='google-auth'),
    path('me/stats/', views.UserDashboardStatsView.as_view(), name='user-stats'),
]
