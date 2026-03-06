import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connections

def audit_postgres():
    conn = connections['default']
    print("\n--- Auditing Postgres ---")
    with conn.cursor() as cursor:
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [row[0] for row in cursor.fetchall()]
        for table in tables:
            try:
                cursor.execute(f'SELECT count(*) FROM "{table}"')
                count = cursor.fetchone()[0]
                cursor.execute(f'SELECT * FROM "{table}" LIMIT 1')
                row = cursor.fetchone()
                print(f"{table}: {count} rows. Example: {row}")
            except Exception as e:
                print(f"Error auditing {table}: {e}")

if __name__ == '__main__':
    audit_postgres()
