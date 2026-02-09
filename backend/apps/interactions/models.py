from django.db import models
from django.conf import settings
from apps.bikes.models import BikeModel

class Review(models.Model):
    bike = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('bike', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.bike.name} ({self.rating}/5)"

class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    bikes = models.ManyToManyField(BikeModel, related_name='wishlisted_by', blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Wishlist"

class Inquiry(models.Model):
    INQUIRY_TYPES = [
        ('general', 'General Inquiry'),
        ('support', 'Technical Support'),
        ('sales', 'Sales & Advertising'),
        ('feedback', 'Feedback'),
        ('other', 'Other'),
        ('advertise', 'Advertising Request'),
    ]
    
    name = models.CharField(max_length=255)
    email = models.EmailField()
    company = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=50, choices=INQUIRY_TYPES, default='general')
    message = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Inquiries'
        
    def __str__(self):
        return f"{self.subject} - {self.email}"
