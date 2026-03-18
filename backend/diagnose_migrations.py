"""
Script to diagnose migration state.
Run with: python manage.py runscript diagnose_migrations
Or just: python diagnose_migrations.py (from backend dir with venv)
"""
import django
import os
import sys

# Add backend dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check applied migrations for interactions
    cursor.execute("SELECT app, name FROM django_migrations WHERE app = 'interactions' ORDER BY name;")
    rows = cursor.fetchall()
    print("=== Applied interactions migrations ===")
    if rows:
        for row in rows:
            print(f"  {row[0]} | {row[1]}")
    else:
        print("  (none)")

    # Check tables
    cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE 'interactions%'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    print("\n=== interactions tables in DB ===")
    if tables:
        for t in tables:
            print(f"  {t[0]}")
    else:
        print("  (none)")

    # All mig records that are relevant
    cursor.execute("""
        SELECT app, name FROM django_migrations 
        ORDER BY app, name;
    """)
    all_migs = cursor.fetchall()
    print("\n=== All applied migrations ===")
    for m in all_migs:
        print(f"  {m[0]} | {m[1]}")
