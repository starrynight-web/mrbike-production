import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connections

def audit_user_columns():
    conn = connections['default']
    with conn.cursor() as cursor:
        cursor.execute("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users_user'")
        columns = cursor.fetchall()
        print("\n--- Columns in users_user ---")
        for col in columns:
            print(f"Col: {col[0]}, Nullable: {col[1]}, Default: {col[2]}")

if __name__ == '__main__':
    audit_user_columns()
