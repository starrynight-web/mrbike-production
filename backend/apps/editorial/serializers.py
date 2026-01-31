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
    bike_name = serializers.ReadOnlyField(source='bike_model.name')
    
    class Meta:
        model = Review
        fields = '__all__'
