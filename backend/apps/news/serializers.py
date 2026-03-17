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
        slug_field='slug', 
        queryset=NewsCategory.objects.all()
    )
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 
            'featured_image', 'author', 'category', 'tags', 
            'views', 'is_published', 'meta_title', 'meta_description',
            'published_at', 'created_at', 'updated_at'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        image_field = instance.featured_image
        
        if image_field:
            if hasattr(image_field, 'url') and image_field.url:
                url = image_field.url
                if url.startswith('http://'): url = url.replace('http://', 'https://')
                representation['featured_image'] = url
            else:
                public_id = str(image_field)
                if public_id and public_id != 'None':
                    if "image/upload/" in public_id:
                        public_id = public_id.split("image/upload/")[-1]
                        import re
                        public_id = re.sub(r'^v\d+/', '', public_id)
                    if '.' in public_id:
                        public_id = public_id.rsplit('.', 1)[0]
                    
                    try:
                        import cloudinary.utils
                        url, _ = cloudinary.utils.cloudinary_url(
                            public_id,
                            secure=True,
                            transformation=[{'quality': 'auto', 'fetch_format': 'auto'}]
                        )
                        representation['featured_image'] = url
                    except Exception:
                        pass
                        
        # Add summary for SEO fallback
        representation['summary'] = instance.meta_description or instance.excerpt or (instance.content[:160] + '...' if instance.content else '')
        
        return representation

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
        elif isinstance(tags_input, list):
            tag_names = [str(t).strip() for t in tags_input if str(t).strip()]
        else:
            return

        for name in tag_names:
            tag, created = Tag.objects.get_or_create(name=name)
            article.tags.add(tag)
