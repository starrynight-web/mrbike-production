from rest_framework import generics, permissions, parsers, status
from .models import Article
from .serializers import ArticleSerializer
from apps.core.responses import StandardResponse
from apps.core.authentication import LenientJWTAuthentication
from django.core.cache import cache
from apps.core.permissions import IsSuperAdminOnly, IsStaffWithRole
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

class ArticleListCreateView(generics.ListCreateAPIView):
    authentication_classes = [LenientJWTAuthentication]
    serializer_class = ArticleSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            queryset = Article.objects.all().order_by('-created_at')
        else:
            queryset = Article.objects.filter(is_published=True).order_by('-published_at')

        search_query = self.request.query_params.get('search', None)
        if search_query:
            from django.contrib.postgres.search import SearchQuery, SearchRank
            from django.db.models import F
            query = SearchQuery(search_query)
            queryset = queryset.annotate(
                rank=SearchRank(F('search_vector'), query)
            ).filter(rank__gte=0.1).order_by('-rank', '-published_at')

        return queryset

    def get(self, request, *args, **kwargs):
        """
        Get news articles with caching for list (but not for search queries).
        Cache is skipped when search parameters are present.
        """
        # Skip cache for search queries
        if request.query_params.get('search'):
            return super().get(request, *args, **kwargs)
        
        # Generate cache key based on query parameters (excluding search)
        # This ensures different pagination/filters get separate cache entries
        cache_params = dict(request.query_params)
        cache_params.pop('search', None)  # Remove search from cache key
        cache_key = f"article_list_{hash(frozenset(cache_params.items()))}"
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            from rest_framework.response import Response
            return Response(cached_data)
        
        # Get the response from parent
        response = super().get(request, *args, **kwargs)
        
        # Cache the response data for 15 minutes (900 seconds)
        cache.set(cache_key, response.data, 900)
        
        return response

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStaffWithRole('staff_news')()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        article = serializer.save(author=self.request.user)
        # Wrap create response in success() if we want to customize, but usually 201 is better handled.
        # However, for consistency with our FE ApiService:
        pass

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return StandardResponse.success(
            data=response.data, 
            message="Article created successfully",
            status_code=status.HTTP_201_CREATED
        )

class ArticleDetailView(generics.RetrieveAPIView):
    authentication_classes = [LenientJWTAuthentication]
    serializer_class = ArticleSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return Article.objects.all()
        return Article.objects.filter(is_published=True)

    @method_decorator(cache_page(60 * 15))
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class ArticleAdminUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffWithRole('staff_news')]
    
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    lookup_field = 'pk'
