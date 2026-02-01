from rest_framework import viewsets, filters
from .models import Category, Article, Review
from .serializers import EditorialCategorySerializer, ArticleSerializer, ReviewSerializer

class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.filter(is_published=True).order_by('-published_at')

    serializer_class = ArticleSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content']

class ReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'pros', 'cons']

class EditorialCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = EditorialCategorySerializer
