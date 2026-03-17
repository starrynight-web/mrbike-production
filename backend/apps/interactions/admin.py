from django.contrib import admin
from .models import Review, Wishlist, WishlistItem, Inquiry

class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 1

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('bike', 'user', 'rating', 'is_verified_purchase', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'is_approved', 'created_at')
    search_fields = ('bike__name', 'user__username', 'comment')
    raw_id_fields = ('bike', 'user')

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'updated_at')
    search_fields = ('user__username', 'user__email')
    inlines = [WishlistItemInline]
    raw_id_fields = ('user',)

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'is_resolved', 'created_at')
    list_filter = ('subject', 'is_resolved', 'created_at')
    search_fields = ('name', 'email', 'message')
    actions = ['mark_as_resolved']

    def mark_as_resolved(self, request, queryset):
        queryset.update(is_resolved=True)
    mark_as_resolved.short_description = "Mark selected inquiries as resolved"
