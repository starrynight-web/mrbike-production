from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from cloudinary.models import CloudinaryField
from django.contrib.postgres.search import SearchVectorField, SearchVector
from django.contrib.postgres.indexes import GinIndex
from datetime import datetime
from typing import Optional, Any, cast

class NewsCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = cast(Any, slugify(self.name))
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = cast(Any, slugify(self.name))
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name

class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField()
    content = models.TextField()
    featured_image = CloudinaryField('image', folder='mrbikebd/news/', blank=True, null=True)
    
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='articles'
    )
    
    category = models.ForeignKey(
        NewsCategory, 
        on_delete=models.PROTECT,
        related_name='articles'
    )
    tags = models.ManyToManyField(Tag, blank=True)
    
    views = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    
    # SEO & Settings
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Advanced Search Vector
    search_vector = SearchVectorField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = cast(Any, slugify(self.title))
        
        # Auto-set published_at when article is published
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        elif not self.is_published:
            self.published_at = None
            
        super().save(*args, **kwargs)
        
        # Update search_vector separately to avoid recursion and handle Postgres vectorization
        if self.pk:
            self.__class__.objects.filter(pk=self.pk).update(
                search_vector=SearchVector('title', weight='A') + SearchVector('content', weight='B')
            )

    def __str__(self) -> str:
        return self.title

    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['is_published', '-published_at']),
            models.Index(fields=['category']),
            GinIndex(fields=['search_vector']),
        ]
