from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone

schema_view = get_schema_view(
   openapi.Info(
      title="MrBikeBD API",
      default_version='v1',
      description="Backend API for MrBikeBD ecosystem",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,) if settings.DEBUG else (permissions.IsAdminUser,),
)

# API v1 versioning
v1_patterns = [
    path('admin/', include('apps.core.urls')),
    path('users/', include('apps.users.urls')),
    path('bikes/', include('apps.bikes.urls')),
    path('marketplace/', include('apps.marketplace.urls')),
    path('news/', include('apps.news.urls')),
    path('interactions/', include('apps.interactions.urls')),
]

def health_check(request):
    return JsonResponse({"status": "ok", "message": "MrBikeBD API is running.", "timestamp": timezone.now().isoformat()})

urlpatterns = [
    path('_mrb-control/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    
    # Versioned API
    path('api/v1/', include(v1_patterns)),
    path('api/recommendations/', include('apps.bikes.recommendation_urls')),

    # Swagger Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Custom Error Handlers
handler404 = 'apps.core.views.handler404'
handler500 = 'apps.core.views.handler500'
