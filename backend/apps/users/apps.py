from django.apps import AppConfig
from django.db.backends.signals import connection_created

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        connection_created.connect(activate_wal_mode)

def activate_wal_mode(sender, connection, **kwargs):
    """Enable WAL mode for SQLite to improve concurrency."""
    if connection.vendor == 'sqlite':
        with connection.cursor() as cursor:
            cursor.execute('PRAGMA journal_mode=WAL;')
            cursor.execute('PRAGMA synchronous=NORMAL;')
