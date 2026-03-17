from django.urls import path
from .views import AdminSettingsView, HealthCheckView

urlpatterns = [
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
