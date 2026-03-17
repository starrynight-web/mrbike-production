from django.contrib import admin
from django.utils import timezone
from .models import UsedBikeListing, ListingImage

class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1
    readonly_fields = ('size_display', 'compression_ratio')
    
    def size_display(self, obj):
        if obj.file_size_original:
            return f"{obj.file_size_original / 1024:.1f} KB"
        return "-"
    size_display.short_description = "Original Size"

@admin.register(UsedBikeListing)
class UsedBikeListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'seller', 'price', 'location_city', 'status', 'is_verified', 'created_at')
    list_filter = ('status', 'is_verified', 'location_division', 'condition', 'is_featured', 'is_urgent')
    search_fields = ('title', 'description', 'seller__username', 'contact_number', 'location_city')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ListingImageInline]
    actions = ['approve_listings', 'reject_listings']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('seller', 'title', 'slug', 'bike_model', 'category', 'price', 'status', 'is_verified')
        }),
        ('Bike Condition & Details', {
            'fields': ('condition', 'mileage', 'manufacturing_year', 'registration_year', 'has_accident_history', 'engine_condition', 'body_condition', 'ownership_count', 'has_original_papers', 'registration_type')
        }),
        ('Location & Contact', {
            'fields': ('location', 'location_division', 'location_city', 'location_area', 'contact_number')
        }),
        ('Marketing & Visibility', {
            'fields': ('is_featured', 'is_urgent', 'views_count', 'expires_at')
        }),
        ('Moderation', {
            'fields': ('rejection_reason', 'reviewed_by', 'reviewed_at')
        }),
    )
    readonly_fields = ('reviewed_by', 'reviewed_at', 'views_count')

    def approve_listings(self, request, queryset):
        rows_updated = queryset.update(
            status='active', 
            is_verified=True, 
            reviewed_by=request.user, 
            reviewed_at=timezone.now()
        )
        self.message_user(request, f"{rows_updated} listings successfully approved.")
    approve_listings.short_description = "Approve selected listings"

    def reject_listings(self, request, queryset):
        # Rejection usually requires a reason, so this bulk action just marks them
        # but in a real app you'd want a form for the reason.
        rows_updated = queryset.update(
            status='rejected', 
            reviewed_by=request.user, 
            reviewed_at=timezone.now()
        )
        self.message_user(request, f"{rows_updated} listings marked as rejected.")
    reject_listings.short_description = "Mark selected as rejected (General Reason)"

@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('listing__title',)
