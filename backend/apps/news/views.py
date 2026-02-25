from rest_framework import generics, permissions, parsers
from .models import Article
from .serializers import ArticleSerializer
from apps.core.permissions import IsSuperAdminOnly

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
        serializer.save(author=self.request.user)

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
    permission_class_list = [IsSuperAdminOnly]
    
    def get_permissions(self):
        return [permission() for permission in self.permission_class_list]
        
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    lookup_field = 'pk'
