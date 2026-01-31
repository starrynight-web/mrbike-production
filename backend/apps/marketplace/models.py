from django.db import models
from django.conf import settings
from apps.bikes.models import BikeModel

class UsedBikeListing(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('need_work', 'Needs Work'),
    ]

    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings')
    bike_model = models.ForeignKey(BikeModel, on_delete=models.SET_NULL, null=True, blank=True)
    
    # If not in our official list
    custom_brand = models.CharField(max_length=100, blank=True, null=True)
    custom_model = models.CharField(max_length=100, blank=True, null=True)
    
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.IntegerField(help_text="Total kilometers driven")
    manufacturing_year = models.IntegerField()
    registration_year = models.IntegerField(null=True, blank=True)
    
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    description = models.TextField()
    location = models.CharField(max_length=255)
    
    # Verification & Status
    is_verified = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20, 
        choices=[('active', 'Active'), ('sold', 'Sold'), ('expired', 'Expired'), ('pending', 'Pending')],
        default='pending'
    )
    
    # Premium features
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    
    # Metadata
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.price} BDT"

    class Meta:
        ordering = ['-is_featured', '-created_at']

class ListingImage(models.Model):
    listing = models.ForeignKey(UsedBikeListing, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500)
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']
