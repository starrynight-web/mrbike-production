"""
Marketplace Models with Image Processing
Includes automatic compression and WebP conversion for used bike images
"""

from django.db import models
from django.conf import settings
from apps.bikes.models import BikeModel
from .image_processor import ImageProcessingService
from cloudinary.models import CloudinaryField
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField

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
    bike_model = models.ForeignKey(BikeModel, on_delete=models.SET_NULL, null=True, blank=True, related_name='marketplace_listings')
    
    # SEO & URL
    slug = models.SlugField(max_length=350, unique=True, blank=True)
    
    # If not in our official list
    custom_brand = models.CharField(max_length=100, blank=True, null=True)
    custom_model = models.CharField(max_length=100, blank=True, null=True)
    
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Price in BDT")
    mileage = models.IntegerField(help_text="Total kilometers driven")
    manufacturing_year = models.IntegerField()
    registration_year = models.IntegerField(null=True, blank=True)
    
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    description = models.TextField()
    
    # Location Refinement (Section 4.5)
    location = models.CharField(max_length=255, help_text="Full address or area")
    location_city = models.CharField(max_length=100, db_index=True, null=True, blank=True)
    location_area = models.CharField(max_length=100, null=True, blank=True)
    location_division = models.CharField(max_length=100, null=True, blank=True)
    
    contact_number = models.CharField(max_length=20, null=True, blank=True, help_text="Seller contact number")
    whatsapp_number = models.CharField(max_length=20, null=True, blank=True, help_text="Whatsapp number for quick contact")
    
    # Detailed Condition (Section 4.5)
    has_accident_history = models.BooleanField(default=False)
    engine_condition = models.CharField(max_length=100, null=True, blank=True)
    body_condition = models.CharField(max_length=100, null=True, blank=True)
    engine_cc = models.IntegerField(null=True, blank=True, help_text="Engine capacity in CC")
    modifications = models.TextField(null=True, blank=True, help_text="List any modifications")
    ownership_count = models.SmallIntegerField(default=1)
    has_original_papers = models.BooleanField(default=True)
    registration_type = models.CharField(max_length=50, blank=True, null=True)
    
    # Expiry logic
    expires_at = models.DateTimeField(null=True, blank=True)
    
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
    
    # SEO & Metadata
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    
    # Metadata
    views_count = models.PositiveIntegerField(default=0)
    search_vector = SearchVectorField(null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        from django.utils.text import slugify
        from django.utils import timezone
        import uuid

        # 1. Sync category from bike_model if available
        if self.bike_model and not self.category:
            self.category = self.bike_model.category

        # 2. Auto-generate slug (Section 9.1)
        # brand-bike-name-model_year-location-bangladesh
        should_update_slug = not self.slug or kwargs.get('force_slug_update', False)
        
        if should_update_slug:
            brand_name = (self.bike_model.brand.name if self.bike_model and self.bike_model.brand else (self.custom_brand or "other")).strip()
            model_name = (self.bike_model.name if self.bike_model else (self.custom_model or "bike")).strip()
            
            # Avoid repeating brand name
            if model_name.lower().startswith(brand_name.lower()):
                display_name = model_name
            else:
                display_name = f"{brand_name} {model_name}"
                
            city = (self.location_city or "dhaka").strip().lower()
            
            # Construct base slug as requested: brand-bike-name-year-location-bangladesh
            # We use slugify on each part to ensure clean format
            slug_parts = [
                slugify(display_name),
                str(self.manufacturing_year),
                slugify(city),
                "bangladesh"
            ]
            base_slug = "-".join(slug_parts)
            self.slug = base_slug
            
            # Ensure uniqueness
            original_slug = self.slug
            counter = 1
            while UsedBikeListing.objects.filter(slug=self.slug).exclude(id=self.id).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1

        # 4. Input Sanitization (Bleach)
        from apps.core.utils import sanitize_html
        if self.description:
            self.description = sanitize_html(self.description)

        super().save(*args, **kwargs)
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=15)

        # Pop custom kwargs before calling super().save() as Django doesn't support arbitrary kwargs
        kwargs.pop('force_slug_update', None)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.price} BDT"

    class Meta:
        ordering = ['-is_featured', '-created_at']
        indexes = [
            models.Index(fields=['status', 'is_verified']),
            models.Index(fields=['location_city', 'category']),
            models.Index(fields=['price', 'created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['seller', 'created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['status', 'location_city', 'created_at']),
            models.Index(fields=['price']),
            models.Index(fields=['bike_model']),
            GinIndex(fields=['search_vector']),
        ]


class ListingImage(models.Model):
    id = models.BigAutoField(primary_key=True)
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
        import cloudinary.utils
        import re
        
        # Order of preference: WebP, Compressed, Original
        candidates = [
            (self.webp_image, True), # use_webp=True
            (self.compressed_image, False),
            (self.original_image, False)
        ]
        
        for field, is_webp in candidates:
            if not field:
                continue
            
            # Case 1: Field has a direct .url attribute (typical for CloudinaryField)
            try:
                if hasattr(field, 'url') and field.url:
                    url = field.url
                    # Standardize to HTTPS
                    if url.startswith('http://'):
                        url = url.replace('http://', 'https://')
                    return url
                
                # Case 2: Extract public_id and generate URL manually for better control
                public_id = str(field)
                if not public_id or public_id == 'None':
                    continue
                
                # Strip absolute URL prefixes if they accidentally got stored
                if "http" in public_id and "image/upload/" in public_id:
                    public_id = public_id.split("image/upload/")[-1]
                
                # Remove version prefix (v12345678/)
                public_id = re.sub(r'^v\d+/', '', public_id)
                
                # Remove extension if present (Cloudinary doesn't need it for URL generation with format/transform)
                if '.' in public_id:
                    public_id = public_id.rsplit('.', 1)[0]
                
                # Generate secured URL with auto-optimization
                # Fallback to hardcoded cloud_name if settings fails
                try:
                    from django.conf import settings
                    cloud_name = getattr(settings, 'CLOUDINARY_STORAGE', {}).get('CLOUD_NAME')
                except Exception:
                    cloud_name = None

                url, _ = cloudinary.utils.cloudinary_url(
                    public_id,
                    cloud_name=cloud_name,
                    secure=True,
                    format='webp' if is_webp else None,
                    transformation=[
                        {'quality': 'auto', 'fetch_format': 'auto'}
                    ] if not is_webp else [{'quality': 'auto'}]
                )
                
                if url:
                    if url.startswith('http://'):
                        url = url.replace('http://', 'https://')
                    return url
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error resolving Cloudinary URL for field {field}: {e}")
                continue
        
        return None
    
    @property
    def compression_ratio(self):
        """Calculate compression ratio"""
        if self.file_size_original and self.file_size_webp:
            ratio = (1 - self.file_size_webp / self.file_size_original) * 100
            return round(ratio, 2)
        return None

class ReportListing(models.Model):
    REPORT_REASONS = [
        ('fake_listing', 'Fake Listing/Fraud'),
        ('wrong_information', 'Wrong Information'),
        ('item_sold', 'Item Already Sold'),
        ('offensive_content', 'Offensive Content'),
        ('duplicate', 'Duplicate Listing'),
        ('other', 'Other'),
    ]

    listing = models.ForeignKey(UsedBikeListing, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=50, choices=REPORT_REASONS)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.listing.title} - {self.reason}"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Reported Listings"
