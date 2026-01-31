from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsedBikeListingViewSet

router = DefaultRouter()
router.register(r'listings', UsedBikeListingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
