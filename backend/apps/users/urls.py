from django.urls import path
from .views import SendOTPView, VerifyOTPView

urlpatterns = [
    path('auth/otp/send/', SendOTPView.as_view(), name='send_otp'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),
]
