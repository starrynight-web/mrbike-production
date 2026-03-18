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

with open('db_diagnosis.txt', 'w', encoding='utf-8') as f:
    f.write("=== Applied interactions migrations ===\n")
    migs = run_query("SELECT app, name FROM django_migrations WHERE app = 'interactions' ORDER BY name;")
    if migs:
        for m in migs:
            f.write(f"  {m[0]} | {m[1]}\n")
    else:
        f.write("  (none)\n")

    f.write("\n=== interactions tables in DB ===\n")
    tables = run_query("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE 'interactions%'
        ORDER BY table_name;
    """)
    if tables:
        for t in tables:
            f.write(f"  {t[0]}\n")
    else:
        f.write("  (none)\n")

    f.write("\n=== All tables (top 20) ===\n")
    all_tables = run_query("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name LIMIT 20;
    """)
    if all_tables:
        for t in all_tables:
            f.write(f"  {t[0]}\n")

    f.write("\n=== Latest 5 applied migrations ===\n")
    last_migs = run_query("""
        SELECT app, name, applied FROM django_migrations 
        ORDER BY applied DESC LIMIT 5;
    """)
    if last_migs:
        for m in last_migs:
            f.write(f"  {m[0]} | {m[1]} | {m[2]}\n")
