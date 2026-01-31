from django.db import models
from django.conf import settings
from django.utils.text import slugify
from apps.bikes.models import BikeModel

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Article(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='articles')
    
    content = models.TextField()
    summary = models.TextField(max_length=500, blank=True)
    featured_image = models.URLField(max_length=500, blank=True, null=True)
    
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Review(models.Model):
    bike = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='professional_reviews')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=1, help_text="Rating out of 10")
    
    pros = models.TextField(help_text="Comma-separated pros", blank=True)
    cons = models.TextField(help_text="Comma-separated cons", blank=True)
    
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review: {self.bike.name} by {self.author}"
