from rest_framework import generics, permissions, parsers, status
from apps.core.permissions import IsSuperAdminOnly
from .models import Article
from .serializers import ArticleSerializer
from .services import ArticleService
from apps.core.responses import StandardResponse

class ArticleListCreateView(generics.ListCreateAPIView):
    serializer_class = ArticleSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return Article.objects.all().order_by('-created_at')
        return Article.objects.filter(is_published=True).order_by('-published_at')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSuperAdminOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        ArticleService.create_article(serializer.validated_data, self.request.user)
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
    serializer_class = ArticleSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return Article.objects.all()
        return Article.objects.filter(is_published=True)

class ArticleAdminUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsSuperAdminOnly]
    
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    lookup_field = 'pk'
