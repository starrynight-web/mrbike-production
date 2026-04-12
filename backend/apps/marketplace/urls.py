from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsedBikeListingViewSet, ShopViewSet

router = DefaultRouter()
router.register(r'listings', UsedBikeListingViewSet, basename='used-bike-listing')
router.register(r'shops', ShopViewSet, basename='shop')

urlpatterns = [
    path('', include(router.urls)),
]
