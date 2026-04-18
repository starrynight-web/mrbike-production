from rest_framework import serializers
from .models import SiteConfig

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = ['key', 'value', 'updated_at', 'updated_by']
        read_only_fields = ['updated_at', 'updated_by']
