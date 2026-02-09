from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsedBikeListingViewSet

router = DefaultRouter()
router.register(r'', UsedBikeListingViewSet, basename='used-bike-listing')

urlpatterns = [
    path('', include(router.urls)),
]
