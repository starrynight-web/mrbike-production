from django.db import models
from django.conf import settings
from apps.bikes.models import BikeModel

class Review(models.Model):
    id = models.BigAutoField(primary_key=True)
    bike = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=255, blank=True, null=True)
    comment = models.TextField()
    
    # New fields from Section 4.4 of Implementation Plan
    mileage_claimed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    top_speed_claimed = models.IntegerField(null=True, blank=True)
    
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('bike', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.bike.name} ({self.rating}/5)"

class Wishlist(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    bikes = models.ManyToManyField(BikeModel, through='WishlistItem', related_name='wishlisted_by')
    
    updated_at = models.DateTimeField(auto_now=True)
 
    def __str__(self):
        return f"{self.user.username}'s Wishlist"

class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE)
    bike = models.ForeignKey(BikeModel, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'bike')
        ordering = ['-added_at']

class Inquiry(models.Model):
    id = models.BigAutoField(primary_key=True)
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

class UserViewHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='view_history')
    bike_model = models.ForeignKey(BikeModel, on_delete=models.CASCADE, related_name='views')
    view_count = models.PositiveIntegerField(default=1)
    last_viewed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'bike_model')
        ordering = ['-last_viewed']

    def __str__(self):
        return f"{self.user.username} viewed {self.bike_model.name} ({self.view_count} times)"
