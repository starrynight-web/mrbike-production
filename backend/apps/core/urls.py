from django.urls import path
from .views import AdminSettingsView

urlpatterns = [
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
]
