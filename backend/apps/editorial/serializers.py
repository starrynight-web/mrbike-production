from rest_framework import serializers
from .models import Category, Article, Review

class EditorialCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = Article
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    bike_name = serializers.ReadOnlyField(source='bike.name')
    author_name = serializers.ReadOnlyField(source='author.username')
    
    class Meta:
        model = Review
        fields = ['id', 'bike', 'bike_name', 'author', 'author_name', 'title', 'content', 'rating', 'pros', 'cons', 'is_published', 'created_at']
