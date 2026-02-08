from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, ReviewViewSet, EditorialCategoryViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'categories', EditorialCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
