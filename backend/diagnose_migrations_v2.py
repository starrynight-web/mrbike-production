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

print("=== Applied interactions migrations ===")
migs = run_query("SELECT app, name FROM django_migrations WHERE app = 'interactions' ORDER BY name;")
for m in migs:
    print(f"  {m[0]} | {m[1]}")

print("\n=== interactions tables in DB ===")
tables = run_query("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE 'interactions%'
    ORDER BY table_name;
""")
for t in tables:
    print(f"  {t[0]}")

print("\n=== All tables (top 20) ===")
all_tables = run_query("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name LIMIT 20;
""")
for t in all_tables:
    print(f"  {t[0]}")
