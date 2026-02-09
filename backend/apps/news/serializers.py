from rest_framework import serializers
from .models import Article, NewsCategory, Tag
from apps.users.serializers import UserSerializer

class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = NewsCategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 
            'featured_image', 'author', 'category', 'tags', 
            'views', 'is_published', 'published_at', 
            'created_at', 'updated_at'
        ]
