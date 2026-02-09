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
    category = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=NewsCategory.objects.all()
    )
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 
            'featured_image', 'author', 'category', 'tags', 
            'views', 'is_published', 'published_at', 
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        tags_data = self.initial_data.get('tags')
        article = Article.objects.create(**validated_data)
        if tags_data:
            self._handle_tags(article, tags_data)
        return article

    def update(self, instance, validated_data):
        tags_data = self.initial_data.get('tags')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags_data is not None:
            instance.tags.clear()
            self._handle_tags(instance, tags_data)
        return instance

    def _handle_tags(self, article, tags_input):
        if isinstance(tags_input, str):
            tag_names = [t.strip() for t in tags_input.split(',') if t.strip()]
            for name in tag_names:
                tag, created = Tag.objects.get_or_create(name=name)
                article.tags.add(tag)
