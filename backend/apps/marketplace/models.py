"""
Marketplace Models with Image Processing
Includes automatic compression and WebP conversion for used bike images
"""

from django.db import models
from django.conf import settings
from apps.bikes.models import BikeModel
from .image_processor import ImageProcessingService
from cloudinary.models import CloudinaryField

class UsedBikeListing(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('need_work', 'Needs Work'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
        ('sold', 'Sold'),
        ('expired', 'Expired'),
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
    contact_number = models.CharField(max_length=20, null=True, blank=True, help_text="Seller contact number for this listing")
    
    # Categorization
    category = models.CharField(
        max_length=20, 
        choices=BikeModel.CATEGORY_CHOICES,
        default='commuter',
        blank=True,
        help_text="Bike category (e.g. Sports, Commuter)"
    )
    
    # Verification & Status
    is_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Moderation
    rejection_reason = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviewed_listings'
    )
    
    # Premium features
    is_featured = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    
    # Metadata
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Sync category from bike_model if available
        if self.bike_model and not self.category:
            self.category = self.bike_model.category
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.price} BDT"

    class Meta:
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['location']),
        ]


class ListingImage(models.Model):
    """
    Image model for used bike listings
    Automatically processes images:
    - Compresses to reduce file size
    - Converts to WebP format (modern, smaller)
    - Keeps original for fallback
    """
    
    listing = models.ForeignKey(
        UsedBikeListing,
        on_delete=models.CASCADE,
        related_name='images',
        help_text="Parent used bike listing"
    )
    
    # Original image (user uploaded)
    original_image = CloudinaryField(
        'image',
        folder='mrbikebd/used-bikes/originals/',
        help_text="Original user-uploaded image"
    )
    
    # Processed versions
    webp_image = CloudinaryField(
        'image',
        folder='mrbikebd/used-bikes/webp/',
        null=True,
        blank=True,
        help_text="WebP version (modern browsers, smallest size)"
    )
    
    compressed_image = CloudinaryField(
        'image',
        folder='mrbikebd/used-bikes/compressed/',
        null=True,
        blank=True,
        help_text="Compressed JPEG (fallback, older browsers)"
    )
    
    # Metadata
    is_primary = models.BooleanField(default=False, help_text="Used as thumbnail")
    order = models.IntegerField(default=0, help_text="Display order in gallery")
    file_size_original = models.IntegerField(
        null=True,
        blank=True,
        help_text="Original file size in bytes"
    )
    file_size_webp = models.IntegerField(
        null=True,
        blank=True,
        help_text="WebP file size in bytes"
    )
    file_size_compressed = models.IntegerField(
        null=True,
        blank=True,
        help_text="Compressed file size in bytes"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """
        Override save to persist the image record.
        
        NOTE: Image processing (WebP/compressed conversion) is handled in
        the serializer's create() method where raw file bytes are available.
        CloudinaryField values are URLs/resource objects AFTER upload, not
        raw file data, so PIL cannot open them here.
        """
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.listing.title}"

    class Meta:
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['listing', 'order']),
            models.Index(fields=['is_primary']),
        ]
    
    @property
    def get_best_url(self):
        """Get best image format for current browser (WebP preferred)"""
        for field in [self.webp_image, self.compressed_image, self.original_image]:
            if field:
                try:
                    if hasattr(field, 'url'):
                        return field.url
                    elif isinstance(field, str) and field:
                        # Field is a raw Cloudinary public_id string
                        import cloudinary.utils
                        return cloudinary.utils.cloudinary_url(field)[0]
                except Exception:
                    continue
        return None
    
    @property
    def compression_ratio(self):
        """Calculate compression ratio"""
        if self.file_size_original and self.file_size_webp:
            ratio = (1 - self.file_size_webp / self.file_size_original) * 100
            return round(ratio, 2)
        return None
