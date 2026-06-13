import django_filters
from django.db.models import Q
from .models import UsedBikeListing

class UsedBikeListingFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(method='filter_brand')
    condition = django_filters.CharFilter(method='filter_condition')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    location_city = django_filters.CharFilter(field_name='location_city', lookup_expr='iexact')
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')

    class Meta:
        model = UsedBikeListing
        fields = ['brand', 'condition', 'min_price', 'max_price', 'location_city', 'category', 'status', 'is_featured', 'is_urgent', 'shop']

    def filter_brand(self, queryset, name, value):
        brand_params = self.request.GET.getlist('brand') if self.request else []
        if not brand_params:
            return queryset
            
        # Handle both multi-params (?brand=a&brand=b) and comma-separated (?brand=a,b)
        brands = []
        for bp in brand_params:
            if ',' in bp:
                brands.extend([b.strip() for b in bp.split(',') if b.strip()])
            else:
                brands.append(bp)

        if not brands:
            return queryset
            
        # Create a complex Q object that checks both official brand slug 
        # and custom_brand name (case-insensitive)
        q_objects = Q()
        for b in brands:
            q_objects |= Q(bike_model__brand__slug=b) | Q(custom_brand__iexact=b)
            
        return queryset.filter(q_objects)

    def filter_condition(self, queryset, name, value):
        cond_params = self.request.GET.getlist('condition') if self.request else []
        if not cond_params:
            return queryset
            
        conditions = []
        for cp in cond_params:
            if ',' in cp:
                conditions.extend([c.strip() for c in cp.split(',') if c.strip()])
            else:
                conditions.append(cp)

        if not conditions:
            return queryset
            
        return queryset.filter(condition__in=conditions)
