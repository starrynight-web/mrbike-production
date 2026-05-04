from django.apps import AppConfig

class BikesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.bikes'

    def ready(self):
        import apps.bikes.signals
