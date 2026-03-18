import django
import os
import sys

# Add backend dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from django.db import connection

def run_query(query, params=None):
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        if cursor.description:
            return cursor.fetchall()
        return None

print("=== Removing Fake interactions Migrations ===")
with connection.cursor() as cursor:
    cursor.execute("DELETE FROM django_migrations WHERE app = 'interactions';")
    print(f"Deleted interactions migrations from django_migrations.")

print("=== Verification ===")
migs = run_query("SELECT app, name FROM django_migrations WHERE app = 'interactions' ORDER BY name;")
if migs:
    for m in migs:
        print(f"  {m[0]} | {m[1]}")
else:
    print("  (none - successfully deleted)")
