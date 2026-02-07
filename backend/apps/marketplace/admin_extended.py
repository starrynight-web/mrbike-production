"""
Marketplace Admin Configuration
For managing used bike listings and monitoring user uploads
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.urls import reverse
from django.db.models import Sum, Count, Q
from .models import UsedBikeListing, ListingImage


# ============================================================================
# LISTING IMAGE INLINE
# ============================================================================

class ListingImageInline(admin.TabularInline):
    """Inline editor for listing images"""
    
    model = ListingImage
    extra = 1
    fields = ['original_image', 'webp_image', 'is_primary', 'order', 'compression_ratio_display']
    readonly_fields = ['webp_image', 'compression_ratio_display', 'file_size_display']
    
    def compression_ratio_display(self, obj):
        """Show compression ratio achieved"""
        if obj.compression_ratio:
            return format_html(
                '<span style="background: #4CAF50; color: white; padding: 2px 8px; '
                'border-radius: 3px;">{:.1f}% smaller</span>',
                obj.compression_ratio
            )
        return '-'
    compression_ratio_display.short_description = 'Compression'
    
    def file_size_display(self, obj):
        """Show file sizes"""
        if obj.file_size_original and obj.file_size_webp:
            orig_kb = obj.file_size_original / 1024
            webp_kb = obj.file_size_webp / 1024
            return format_html(
                '{:.1f}KB → {:.1f}KB',
                orig_kb,
                webp_kb
            )
        return '-'
    file_size_display.short_description = 'Size'


# ============================================================================
# USED BIKE LISTING ADMIN
# ============================================================================

@admin.register(UsedBikeListing)
class UsedBikeListingAdmin(admin.ModelAdmin):
    """Admin interface for managing user-uploaded used bike listings"""
    
    list_display = [
        'title',
        'seller_link',
        'price_display',
        'condition_badge',
        'status_badge',
        'is_featured',
        'primary_image_thumbnail',
        'created_at_display',
    ]
    
    list_filter = [
        'status',
        'condition',
        'is_featured',
        'is_verified',
        'location',
        ('created_at', admin.DateFieldListFilter),
    ]
    
    search_fields = ['title', 'description', 'seller__email', 'location', 'custom_brand', 'custom_model']
    
    list_editable = ['is_featured']
    
    fieldsets = (
        ('📋 Listing Details', {
            'fields': ('seller', 'title', 'description', 'location')
        }),
        ('🏍️ Bike Information', {
            'fields': (
                'bike_model',
                ('custom_brand', 'custom_model'),
                'manufacturing_year',
                'registration_year',
                'mileage',
                'condition'
            )
        }),
        ('💰 Pricing', {
            'fields': ('price',)
        }),
        ('✅ Status & Verification', {
            'fields': (
                'status',
                'is_verified',
                'is_featured',
                'is_urgent',
            )
        }),
        ('📊 Analytics', {
            'fields': ('views_count',),
            'classes': ('collapse',),
        }),
        ('🕐 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Read-only automatic timestamps'
        }),
    )
    
    inlines = [ListingImageInline]
    
    readonly_fields = [
        'seller',
        'views_count',
        'created_at',
        'updated_at',
        'primary_image_thumbnail'
    ]
    
    # Filtering
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('seller', 'bike_model__brand')
    
    # Custom actions
    actions = [
        'verify_listings',
        'mark_active',
        'mark_sold',
        'mark_expired',
        'toggle_featured',
        'send_verification_email'
    ]
    
    def verify_listings(self, request, queryset):
        """Mark listings as verified"""
        updated = queryset.update(is_verified=True)
        self.message_user(request, f'✓ {updated} listings verified')
    verify_listings.short_description = '✓ Verify selected listings'
    
    def mark_active(self, request, queryset):
        """Mark listings as active"""
        updated = queryset.update(status='active')
        self.message_user(request, f'✓ {updated} listings marked as active')
    mark_active.short_description = '✓ Mark as Active'
    
    def mark_sold(self, request, queryset):
        """Mark listings as sold"""
        updated = queryset.update(status='sold')
        self.message_user(request, f'✓ {updated} listings marked as sold')
    mark_sold.short_description = '🔖 Mark as Sold'
    
    def mark_expired(self, request, queryset):
        """Mark listings as expired"""
        updated = queryset.update(status='expired')
        self.message_user(request, f'✓ {updated} listings marked as expired')
    mark_expired.short_description = '⏱️ Mark as Expired'
    
    def toggle_featured(self, request, queryset):
        """Toggle featured status"""
        for listing in queryset:
            listing.is_featured = not listing.is_featured
            listing.save()
        self.message_user(request, f'✓ Featured status toggled for {queryset.count()} listings')
    toggle_featured.short_description = '⭐ Toggle Featured'
    
    def send_verification_email(self, request, queryset):
        """Send verification email to sellers asynchronously"""
        from django.core.mail import send_mass_mail
        from django.core.mail.message import EmailMessage
        from threading import Thread
        
        # Filter listings with valid email
        listings_to_email = [
            listing for listing in queryset 
            if listing.seller and listing.seller.email
        ]
        
        if not listings_to_email:
            self.message_user(request, '❌ No sellers with valid email addresses found')
            return
        
        def send_emails_background():
            """Send emails in background thread"""
            messages = []
            for listing in listings_to_email:
                messages.append((
                    'Please verify your listing',
                    f'Hi {listing.seller.username},\n\nPlease verify your listing: {listing.title}',
                    'noreply@mrbikebd.com',
                    [listing.seller.email]
                ))
            
            if messages:
                send_mass_mail(tuple(messages))
        
        # Send emails in background thread
        email_thread = Thread(target=send_emails_background)
        email_thread.daemon = True
        email_thread.start()
        
        self.message_user(request, f'📧 Queued emails for {len(listings_to_email)} sellers')
    send_verification_email.short_description = '📧 Send verification emails'
    
    # Custom display functions
    def seller_link(self, obj):
        """Link to seller profile"""
        url = reverse('admin:users_user_change', args=[obj.seller.id])
        return format_html('<a href="{}">{}</a>', url, obj.seller.email)
    seller_link.short_description = 'Seller'
    
    def price_display(self, obj):
        """Format price with Bangladesh currency"""
        return format_html(
            '<span style="color: #4CAF50; font-weight: bold;">৳ {:,.0f}</span>',
            obj.price
        )
    price_display.short_description = 'Price'
    
    def condition_badge(self, obj):
        """Display condition as colored badge"""
        colors = {
            'excellent': '#4CAF50',
            'good': '#2196F3',
            'fair': '#FF9800',
            'need_work': '#F44336',
        }
        color = colors.get(obj.condition, '#9E9E9E')
        label = obj.get_condition_display()
        
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            label
        )
    condition_badge.short_description = 'Condition'
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'active': '#4CAF50',
            'sold': '#9E9E9E',
            'expired': '#F44336',
            'pending': '#FF9800',
        }
        color = colors.get(obj.status, '#9E9E9E')
        label = obj.get_status_display()
        
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; '
            'border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            label
        )
    status_badge.short_description = 'Status'
    
    def primary_image_thumbnail(self, obj):
        """Display primary image as thumbnail"""
        images = obj.images.filter(is_primary=True).first()
        if not images:
            images = obj.images.first()
        
        if images and images.get_best_url:
            return format_html(
                '<img src="{}" width="80" height="80" style="border-radius: 5px; object-fit: cover;" />',
                images.get_best_url
            )
        return 'No image'
    primary_image_thumbnail.short_description = 'Image'
    
    def created_at_display(self, obj):
        """Format created date"""
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created_at_display.short_description = 'Created'


# ============================================================================
# LISTING IMAGE ADMIN (Standalone)
# ============================================================================

@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    """Admin for managing individual listing images"""
    
    list_display = [
        'listing_title',
        'image_preview',
        'format_status',
        'compression_info',
        'is_primary',
    ]
    
    list_filter = [
        'is_primary',
        'created_at',
    ]
    
    search_fields = ['listing__title']
    
    fieldsets = (
        ('Image Information', {
            'fields': ('listing', 'is_primary', 'order')
        }),
        ('Image Files', {
            'fields': ('original_image', 'webp_image', 'compressed_image')
        }),
        ('Statistics', {
            'fields': (
                'file_size_original',
                'file_size_webp',
                'file_size_compressed'
            ),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = [
        'webp_image',
        'compressed_image',
        'file_size_original',
        'file_size_webp',
        'file_size_compressed',
    ]
    
    def listing_title(self, obj):
        """Show listing title with link"""
        url = reverse('admin:marketplace_usedbbikelisting_change', args=[obj.listing.id])
        return format_html('<a href="{}">{}</a>', url, obj.listing.title)
    listing_title.short_description = 'Listing'
    
    def image_preview(self, obj):
        """Show image preview"""
        url = obj.get_best_url
        if url:
            return format_html(
                '<img src="{}" width="100" height="100" style="border-radius: 5px;" />',
                url
            )
        return 'No image'
    image_preview.short_description = 'Preview'
    
    def format_status(self, obj):
        """Show which formats are available"""
        formats = []
        if obj.original_image:
            formats.append('Original')
        if obj.webp_image:
            formats.append('WebP')
        if obj.compressed_image:
            formats.append('JPEG')
        
        colors = {'Original': '#9E9E9E', 'WebP': '#4CAF50', 'JPEG': '#2196F3'}
        html = ' '.join([
            f'<span style="background: {colors.get(f, "#9E9E9E")}; color: white; '
            f'padding: 2px 6px; border-radius: 2px; font-size: 10px; margin-right: 2px;">{f}</span>'
            for f in formats
        ])
        return format_html(html)
    format_status.short_description = 'Formats'
    
    def compression_info(self, obj):
        """Show compression statistics"""
        if obj.file_size_original and obj.file_size_webp:
            ratio = obj.compression_ratio
            orig_mb = obj.file_size_original / (1024 * 1024)
            webp_mb = obj.file_size_webp / (1024 * 1024)
            return format_html(
                '{:.2f}MB → {:.2f}MB ({:.1f}% ↓)',
                orig_mb,
                webp_mb,
                ratio
            )
        return '-'
    compression_info.short_description = 'Compression'


# ============================================================================
# ADMIN CUSTOMIZATION
# ============================================================================

admin.site.site_header = 'MrBikeBD - Marketplace Management'
admin.site.site_title = 'Marketplace Admin'
admin.site.index_title = 'Welcome to Marketplace Management'
