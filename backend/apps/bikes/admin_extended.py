"""
Admin Configuration for Bike and Marketplace Management
Enables team to add/edit bikes and manage user listings from admin panel
"""

from django.contrib import admin
from django.utils.html import format_html
from django.db.models import F
from .models import Brand, BikeModel, BikeVariant, BikeSpecification


# ============================================================================
# BRAND ADMIN
# ============================================================================

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    """Admin interface for Motorcycle Brands"""
    
    list_display = ['name', 'logo_preview', 'is_popular', 'bike_count']
    list_filter = ['is_popular', 'created_at']
    search_fields = ['name', 'origin_country']
    list_editable = ['is_popular']
    
    fieldsets = (
        ('Brand Identity', {
            'fields': ('name', 'slug', 'logo')
        }),
        ('Details', {
            'fields': ('description', 'origin_country')
        }),
        ('Settings', {
            'fields': ('is_popular',)
        }),
    )
    
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')
    
    def logo_preview(self, obj):
        """Display brand logo as thumbnail"""
        if obj.logo:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 5px;" />',
                obj.logo
            )
        return 'No logo'
    logo_preview.short_description = 'Logo'
    
    def bike_count(self, obj):
        """Show number of bikes for this brand"""
        count = obj.bikes.count()
        return format_html(
            '<span style="background: #4CAF50; color: white; padding: 3px 10px; '
            'border-radius: 3px;">{} bikes</span>',
            count
        )
    bike_count.short_description = 'Total Bikes'


# ============================================================================
# CUSTOM FILTERS
# ============================================================================

class EngineCapacityRangeFilter(admin.SimpleListFilter):
    """Custom filter for engine capacity ranges"""
    title = 'Engine Capacity'
    parameter_name = 'engine_capacity_range'
    
    def lookups(self, request, model_admin):
        return (
            ('under_150', 'Under 150 cc'),
            ('150_300', '150-300 cc'),
            ('300_500', '300-500 cc'),
            ('500_1000', '500-1000 cc'),
            ('over_1000', 'Over 1000 cc'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'under_150':
            return queryset.filter(engine_capacity__lt=150)
        elif self.value() == '150_300':
            return queryset.filter(engine_capacity__gte=150, engine_capacity__lt=300)
        elif self.value() == '300_500':
            return queryset.filter(engine_capacity__gte=300, engine_capacity__lt=500)
        elif self.value() == '500_1000':
            return queryset.filter(engine_capacity__gte=500, engine_capacity__lt=1000)
        elif self.value() == 'over_1000':
            return queryset.filter(engine_capacity__gte=1000)
        return queryset


# ============================================================================
# BIKE VARIANT INLINE
# ============================================================================

class BikeVariantInline(admin.TabularInline):
    """Inline editor for bike variants (colors, ABS, etc.)"""
    
    model = BikeVariant
    extra = 1
    fields = ['variant_name', 'variant_key', 'price', 'color_options', 'is_default']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing
            return ['variant_key']
        return []


class BikeSpecificationInline(admin.StackedInline):
    """Inline editor for bike specifications"""
    
    model = BikeSpecification
    extra = 0
    fields = [
        ('engine_capacity', 'engine_type'),
        ('max_power', 'max_torque'),
        ('fuel_system', 'cooling_system'),
        ('gears', 'clutch_type'),
        ('curb_weight', 'fuel_capacity', 'seat_height'),
        ('tyre_type', 'braking_system'),
    ]


# ============================================================================
# BIKE MODEL ADMIN
# ============================================================================

@admin.register(BikeModel)
class BikeModelAdmin(admin.ModelAdmin):
    """Admin interface for Motorcycle Models (add/edit bikes)"""
    
    list_display = [
        'name',
        'brand',
        'category',
        'price_display',
        'is_available',
        'popularity_score',
        'image_preview'
    ]
    list_filter = [
        'category',
        'brand',
        'is_available',
        'created_at',
        EngineCapacityRangeFilter,
    ]
    search_fields = ['name', 'brand__name', 'slug']
    list_editable = ['is_available', 'category']
    
    fieldsets = (
        ('🔹 Basic Information', {
            'fields': ('brand', 'name', 'slug', 'category')
        }),
        ('🔹 Specifications', {
            'fields': (
                'engine_capacity',
                'engine_type',
                'max_power',
                'max_torque',
                'fuel_system',
                'cooling_system',
            ),
            'classes': ('collapse',),
        }),
        ('🔹 Transmission & Chassis', {
            'fields': (
                'gears',
                'clutch_type',
                'curb_weight',
                'fuel_capacity',
                'seat_height',
                'tyre_type',
            ),
            'classes': ('collapse',),
        }),
        ('🔹 Media & Pricing', {
            'fields': ('primary_image', 'price', 'is_available')
        }),
        ('🔹 Popularity', {
            'fields': ('popularity_score',),
            'classes': ('collapse',),
            'description': 'Higher score = better ranking in search results'
        }),
        ('🔹 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    inlines = [BikeVariantInline, BikeSpecificationInline]
    prepopulated_fields = {'slug': ('brand', 'name')}
    readonly_fields = ('created_at', 'updated_at')
    
    def get_readonly_fields(self, request, obj=None):
        """Make slug readonly only on edit, allow auto-population on create"""
        readonly = list(self.readonly_fields)
        if obj is not None:  # Editing existing object
            readonly.append('slug')
        return readonly
    
    # Custom ordering in admin list
    ordering = ['-popularity_score', 'name']
    
    def price_display(self, obj):
        """Format price display"""
        return format_html(
            '<span style="color: #4CAF50; font-weight: bold;">৳ {:,.0f}</span>',
            obj.price
        )
    price_display.short_description = 'Price'
    
    def image_preview(self, obj):
        """Display bike image as thumbnail"""
        if obj.primary_image:
            return format_html(
                '<img src="{}" width="60" height="60" style="border-radius: 5px; object-fit: cover;" />',
                obj.primary_image
            )
        return 'No image'
    image_preview.short_description = 'Image'
    
    actions = ['mark_available', 'mark_unavailable', 'increase_popularity']
    
    def mark_available(self, request, queryset):
        """Bulk action: mark bikes as available"""
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} bikes marked as available')
    mark_available.short_description = '✅ Mark selected bikes as available'
    
    def mark_unavailable(self, request, queryset):
        """Bulk action: mark bikes as unavailable"""
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} bikes marked as unavailable')
    mark_unavailable.short_description = '❌ Mark selected bikes as unavailable'
    
    def increase_popularity(self, request, queryset):
        """Bulk action: increase popularity score"""
        count = queryset.count()
        queryset.update(popularity_score=F('popularity_score') + 10)
        self.message_user(request, f'{count} bikes popularity increased')
    increase_popularity.short_description = '⭐ Increase popularity (+10)'


# ============================================================================
# BIKE VARIANT ADMIN (Standalone)
# ============================================================================

@admin.register(BikeVariant)
class BikeVariantAdmin(admin.ModelAdmin):
    """Standalone admin for managing bike variants"""
    
    list_display = ['variant_name', 'bike_model', 'price', 'is_default', 'color_count']
    list_filter = ['is_default', 'bike_model__brand', 'created_at']
    search_fields = ['variant_name', 'bike_model__name']
    
    fieldsets = (
        ('Variant Details', {
            'fields': ('bike_model', 'variant_name', 'variant_key', 'is_default')
        }),
        ('Pricing', {
            'fields': ('price', 'color_options')
        }),
        ('Features', {
            'fields': ('features', 'braking_system', 'tire_type'),
            'classes': ('collapse',),
        }),
        ('Performance', {
            'fields': (
                'mileage_company',
                'mileage_user',
                'topspeed_company',
                'topspeed_user'
            ),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def color_count(self, obj):
        """Show number of color options"""
        colors = len(obj.color_options) if obj.color_options else 0
        return format_html(
            '<span style="background: #2196F3; color: white; padding: 3px 10px; '
            'border-radius: 3px;">{} colors</span>',
            colors
        )
    color_count.short_description = 'Colors Available'


# ============================================================================
# CUSTOM ADMIN SITE CONFIGURATION
# ============================================================================

class BikesAdminSite(admin.AdminSite):
    """Customized admin site for bikes app"""
    
    site_header = 'MrBikeBD - Bikes Management'
    site_title = 'Bikes Admin'
    index_title = 'Welcome to MrBikeBD Bikes Management'
    
    def index(self, request, extra_context=None):
        """Custom dashboard"""
        extra_context = extra_context or {}
        extra_context['stats'] = {
            'total_bikes': BikeModel.objects.count(),
            'total_brands': Brand.objects.count(),
            'available_bikes': BikeModel.objects.filter(is_available=True).count(),
            'popular_bikes': BikeModel.objects.filter(popularity_score__gte=50).count(),
        }
        return super().index(request, extra_context)


# ============================================================================
# INSTRUCTIONS FOR TEAM
# ============================================================================

"""
HOW TO USE ADMIN PANEL FOR BIKE MANAGEMENT:

1. LOGIN TO ADMIN:
   - URL: https://yoursite.com/admin/
   - Username: [admin username]
   - Password: [admin password]

2. ADD NEW BIKE:
   - Click "Bikes" → "Add Bike"
   - Fill in brand, name, category
   - Add price (in BDT)
   - Paste Cloudinary image URL in "Primary image" field
   - Click "Save"
   
   For Cloudinary URL:
   1. Go to https://cloudinary.com/
   2. Upload your bike image
   3. Copy the URL (e.g., https://res.cloudinary.com/.../image.jpg)
   4. Paste in admin panel

3. ADD VARIANTS (Colors, ABS, etc.):
   - Click on "BikeVariants" → "Add Variant"
   - Select bike model
   - Enter variant name (e.g., "Standard", "ABS", "Pro")
   - Set price
   - Add color options (e.g., Red, Black, Blue)
   - Check "Is default" for main variant

4. BULK ACTIONS:
   - Select multiple bikes
   - Use "Mark as available" or "Mark as unavailable"
   - Use "Increase popularity" to boost in search results

5. EDIT EXISTING BIKE:
   - Click on the bike name in the list
   - Update any field
   - Click "Save"

6. DELETE BIKE:
   - Select bike → "Delete selected bikes"
   - Confirm deletion
   ⚠️ WARNING: This will remove bike from database!
"""
