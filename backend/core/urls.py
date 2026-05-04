from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from apps.core.sitemap import sitemap_view
from apps.core.health import health_check
import os

# Override default Django admin access to strictly require super admin email
def custom_has_permission(request):
    super_admin_email = os.getenv('SUPER_ADMIN_EMAIL', 'admin_gr_s_n_r_t_e@unleft.space')
    return request.user.is_authenticated and request.user.email == super_admin_email

admin.site.has_permission = custom_has_permission


schema_view = get_schema_view(
   openapi.Info(
      title="MrBikeBD API",
      default_version='v1',
      description="Backend API for MrBikeBD ecosystem",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

# API v1 versioning
v1_patterns = [
    path('admin/', include('apps.core.urls')),
    path('users/', include('apps.users.urls')),
    path('bikes/', include('apps.bikes.urls')),
    path('marketplace/', include('apps.marketplace.urls')),
    path('news/', include('apps.news.urls')),
    path('interactions/', include('apps.interactions.urls')),
    path('recommendations/', include('apps.bikes.recommendation_urls')),
    path('recommendations/v2/', include('apps.recommendations.urls')),
]

urlpatterns = [
    path('mrbikebd-sys-admin/', admin.site.urls),
    path('sitemap.xml', sitemap_view, name='sitemap'),
    path('health/', health_check, name='health'),
    
    # Versioned API
    path('api/v1/', include(v1_patterns)),

    # Swagger Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
