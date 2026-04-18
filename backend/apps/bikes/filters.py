import django_filters
from django.db.models import Q
from .models import BikeModel

class BikeModelFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(method='filter_brand')
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    minPrice = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    maxPrice = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    ccMin = django_filters.NumberFilter(field_name='engine_capacity', lookup_expr='gte')
    ccMax = django_filters.NumberFilter(field_name='engine_capacity', lookup_expr='lte')

    ids = django_filters.BaseInFilter(field_name='id', lookup_expr='in')

    class Meta:
        model = BikeModel
        fields = ['ids', 'brand', 'category', 'minPrice', 'maxPrice', 'ccMin', 'ccMax']

    def filter_brand(self, queryset, name, value):
        # Support both ?brand=slug1&brand=slug2 AND ?brand=slug1,slug2
        brand_params = self.request.query_params.getlist('brand')
        
        all_brands = []
        for param in brand_params:
            if ',' in param:
                all_brands.extend([b.strip() for b in param.split(',') if b.strip()])
            else:
                all_brands.append(param.strip())
        
        if not all_brands:
            return queryset
            
        return queryset.filter(brand__slug__in=all_brands)
