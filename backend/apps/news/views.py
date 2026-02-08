from django.db import models
from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Article, NewsCategory
from .serializers import ArticleSerializer

class ArticleListView(generics.ListAPIView):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'tags__slug']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'views', 'created_at']

class ArticleDetailView(generics.RetrieveAPIView):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_object(self):
        obj = super().get_object()
        # Increment view count
        Article.objects.filter(pk=obj.pk).update(views=models.F('views') + 1)
        return obj
