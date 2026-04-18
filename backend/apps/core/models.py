from django.db import models

class SiteConfig(models.Model):
    """Key-value store for all editable site configuration."""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.key

    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configurations"
