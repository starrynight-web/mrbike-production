import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check applied migrations
    cursor.execute("SELECT app, name FROM django_migrations WHERE app = 'interactions' ORDER BY name;")
    rows = cursor.fetchall()
    print("=== Applied interactions migrations ===")
    for row in rows:
        print(row)
    
    # Check if the table exists
    cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name LIKE 'interactions%'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    print("\n=== interactions tables in DB ===")
    for t in tables:
        print(t)
    
    # All tables
    cursor.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    all_tables = cursor.fetchall()
    print("\n=== All public tables ===")
    for t in all_tables:
        print(t)
