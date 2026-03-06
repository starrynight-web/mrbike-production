import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connections
from apps.marketplace.models import UsedBikeListing

def check_dbs():
    for db in ['default', 'mongodb']:
        conn = connections[db]
        print(f"\n--- Checking DB: {db} ---")
        try:
            with conn.cursor() as cursor:
                # Check tables
                if db == 'default':
                    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                    tables = [row[0] for row in cursor.fetchall()]
                    print(f"Tables in public: {tables}")
                    if 'marketplace_usedbikelisting' in tables:
                        cursor.execute("SELECT count(*) FROM marketplace_usedbikelisting")
                        count = cursor.fetchone()[0]
                        print(f"Count in marketplace_usedbikelisting: {count}")
                else:
                    # MongoDB/Djongo
                    print("MongoDB/Djongo check (limited)")
                    count = UsedBikeListing.objects.using('mongodb').count()
                    print(f"Count in MongoDB via Django: {count}")
        except Exception as e:
            print(f"Error checking {db}: {e}")

if __name__ == '__main__':
    check_dbs()
