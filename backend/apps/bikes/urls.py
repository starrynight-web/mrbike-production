from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, BikeModelViewSet

router = DefaultRouter()
router.register(r'brands', BrandViewSet)
router.register(r'models', BikeModelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
