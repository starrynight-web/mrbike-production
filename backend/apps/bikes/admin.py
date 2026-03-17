from django.contrib import admin
from django.forms import ModelForm, TextInput, URLInput
from .models import Brand, BikeModel, BikeVariant, BikeSpecification

class BrandForm(ModelForm):
    class Meta:
        model = Brand
        fields = '__all__'
        widgets = {
            'logo': URLInput(attrs={'placeholder': 'Paste Cloudinary URL here'}),
        }

class BikeModelForm(ModelForm):
    class Meta:
        model = BikeModel
        fields = '__all__'
        widgets = {
            'primary_image': URLInput(attrs={'placeholder': 'Paste Cloudinary URL here'}),
        }

class BikeSpecificationInline(admin.StackedInline):
    model = BikeSpecification
    can_delete = False
    verbose_name_plural = 'Bike Specifications'

class BikeVariantInline(admin.TabularInline):
    model = BikeVariant
    extra = 1

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    form = BrandForm
    list_display = ('name', 'origin_country', 'is_popular')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BikeModel)
class BikeModelAdmin(admin.ModelAdmin):
    form = BikeModelForm
    list_display = ('name', 'brand', 'category', 'price', 'is_available')
    list_filter = ('brand', 'category', 'is_available')
    search_fields = ('name', 'brand__name')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [BikeSpecificationInline, BikeVariantInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('brand', 'name', 'slug', 'category', 'price', 'is_available', 'primary_image')
        }),
        ('Engine & Performance', {
            'fields': ('engine_capacity', 'engine_type', 'max_power', 'max_torque', 'fuel_system', 'cooling_system')
        }),
        ('Transmission', {
            'fields': ('gears', 'clutch_type')
        }),
        ('Chassis & Dimensions', {
            'fields': ('curb_weight', 'fuel_capacity', 'seat_height', 'tyre_type')
        }),
    )

@admin.register(BikeVariant)
class BikeVariantAdmin(admin.ModelAdmin):
    list_display = ('variant_name', 'bike_model', 'price', 'is_default')
    list_filter = ('is_default', 'bike_model__brand')
    search_fields = ('variant_name', 'bike_model__name')

@admin.register(BikeSpecification)
class BikeSpecificationAdmin(admin.ModelAdmin):
    list_display = ('bike_model',)
    search_fields = ('bike_model__name',)
