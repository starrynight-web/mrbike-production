"""
Updated Marketplace Models with Image Processing
Includes automatic compression and WebP conversion for used bike images
"""

import logging
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.bikes.models import BikeModel
from .image_processor import ImageProcessingService

logger = logging.getLogger(__name__)


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
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['seller', '-created_at']),
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
    original_image = models.ImageField(
        upload_to='used-bikes/originals/%Y/%m/%d/',
        help_text="Original user-uploaded image"
    )
    
    # Processed versions
    webp_image = models.ImageField(
        upload_to='used-bikes/webp/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text="WebP version (modern browsers, smallest size)"
    )
    
    compressed_image = models.ImageField(
        upload_to='used-bikes/compressed/%Y/%m/%d/',
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
        Override save to postpone image processing
        Image processing now happens asynchronously via signal handler
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


# ============================================================================
# SIGNAL HANDLERS FOR ASYNC IMAGE PROCESSING
# ============================================================================

@receiver(post_save, sender=ListingImage)
def process_listing_image(sender, instance, created, **kwargs):
    """
    Process image asynchronously when a new ListingImage is created
    Compresses and converts to WebP in background
    """
    if created and instance.original_image and not instance.webp_image:
        # Queue background task (using threading for simplicity)
        # In production, use Celery or Django-RQ
        from threading import Thread
        
        def process_image_task():
            try:
                # Process image
                processed = ImageProcessingService.compress_and_convert(
                    instance.original_image
                )
                
                # Save WebP version
                if processed.get('webp'):
                    webp_file = processed['webp']
                    instance.webp_image.save(
                        webp_file['name'],
                        webp_file['content'],
                        save=False
                    )
                
                # Save compressed JPEG version
                if processed.get('compressed'):
                    jpg_file = processed['compressed']
                    instance.compressed_image.save(
                        jpg_file['name'],
                        jpg_file['content'],
                        save=False
                    )
                
                # Store file sizes
                if instance.original_image:
                    instance.file_size_original = instance.original_image.size
                if instance.webp_image:
                    instance.file_size_webp = instance.webp_image.size
                if instance.compressed_image:
                    instance.file_size_compressed = instance.compressed_image.size
                
                # Save the instance with processed images
                instance.save(update_fields=[
                    'webp_image', 'compressed_image', 
                    'file_size_original', 'file_size_webp', 'file_size_compressed'
                ])
                
            except (ValueError, OSError) as e:
                # Log specific image-related errors
                listing_id = getattr(instance.listing, 'id', 'unsaved')
                logger.exception(
                    f"Image processing failed for listing {listing_id}: {str(e)}"
                )
        
        # Run in background thread to prevent blocking
        thread = Thread(target=process_image_task)
        thread.daemon = True
        thread.start()
    
    @property
    def get_best_url(self):
        """Get best image format for current browser (WebP preferred)"""
        if self.webp_image:
            return self.webp_image.url
        elif self.compressed_image:
            return self.compressed_image.url
        return self.original_image.url if self.original_image else None
    
    @property
    def compression_ratio(self):
        """Calculate compression ratio"""
        if self.file_size_original and self.file_size_webp:
            ratio = (1 - self.file_size_webp / self.file_size_original) * 100
            return round(ratio, 2)
        return None
