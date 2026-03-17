import os
import sys
import django
from django.db import connection

# Add current directory to path so 'core' can be found
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

with connection.cursor() as cur:
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = [r[0] for r in cur.fetchall()]
    print("--- TABLES ---")
    for t in sorted(tables):
        print(t)
    print("--- END ---")
