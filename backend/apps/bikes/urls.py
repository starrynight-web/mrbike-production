from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, BikeModelViewSet

router = DefaultRouter()
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'models', BikeModelViewSet, basename='bike-model')

urlpatterns = [
    path('', include(router.urls)),
]
