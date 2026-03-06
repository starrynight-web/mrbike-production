import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connections, transaction

def drop_columns():
    conn = connections['default']
    with conn.cursor() as cursor:
        print("Dropping is_phone_verified...")
        cursor.execute("ALTER TABLE users_user DROP COLUMN IF EXISTS is_phone_verified")
        print("Dropping phone...")
        cursor.execute("ALTER TABLE users_user DROP COLUMN IF EXISTS phone")
    # transaction is committed when leaving the WITH block if not using atomic?
    # Actually, in Django, you should use transaction.atomic or commit manually.
    transaction.commit(using='default')
    print("Columns dropped and committed.")

if __name__ == '__main__':
    drop_columns()
