from django.urls import path
from .views import AdminSettingsView, HealthCheckView, HeroImageUploadView, PublicSiteConfigView

urlpatterns = [
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
    path('settings/hero-upload/', HeroImageUploadView.as_view(), name='hero-image-upload'),
    path('site-config/', PublicSiteConfigView.as_view(), name='public-site-config'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
