from rest_framework import generics, permissions, parsers, status
from .models import Article
from .serializers import ArticleSerializer
from apps.core.responses import StandardResponse
from apps.core.authentication import LenientJWTAuthentication
from django.core.cache import cache
from apps.core.permissions import IsSuperAdminOnly, IsStaffWithRole
from django.utils.decorators import method_decorator
from django.utils.decorators import method_decorator

class ArticleListCreateView(generics.ListCreateAPIView):
    authentication_classes = [LenientJWTAuthentication]
    serializer_class = ArticleSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and getattr(self.request.user, 'is_staff', False):
            queryset = Article.objects.all().order_by('-created_at')
        else:
            queryset = Article.objects.filter(is_published=True).order_by('-published_at')

        search_query = self.request.GET.get('search', None)
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
            
        from apps.core.cache_utils import generate_cache_key, cache_aside_get, cache_aside_set
        
        kwargs_for_key = {k: v for k, v in request.query_params.items() if k != 'search'}
        cache_key = generate_cache_key('articles', 'list', **kwargs_for_key)
        
        cached_response = cache_aside_get(cache_key)
        if cached_response:
            return cached_response
            
        response = super().get(request, *args, **kwargs)
        cache_aside_set(cache_key, response.data, timeout=60 * 60)
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
        if self.request.user and self.request.user.is_authenticated and getattr(self.request.user, 'is_staff', False):
            return Article.objects.all()
        return Article.objects.filter(is_published=True)

    def get(self, request, *args, **kwargs):
        from apps.core.cache_utils import generate_cache_key, cache_aside_get, cache_aside_set
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        cache_key = generate_cache_key('articles', 'retrieve', identifier=lookup_value)
        
        cached_response = cache_aside_get(cache_key)
        if cached_response:
            return cached_response
            
        response = super().get(request, *args, **kwargs)
        cache_aside_set(cache_key, response.data, timeout=60 * 60)
        return response

class ArticleAdminUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaffWithRole('staff_news')]
    
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    lookup_field = 'pk'
