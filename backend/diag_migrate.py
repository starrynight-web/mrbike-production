import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
try:
    django.setup()
    from django.core.management import call_command
    call_command('makemigrations', 'users')
except Exception as e:
    import traceback
    traceback.print_exc()
