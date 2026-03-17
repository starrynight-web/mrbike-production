import os
import django
import sys

# Redirect stdout to a file with utf-8 encoding to avoid tool parsing issues
sys.stdout = open('index_check_output.txt', 'w', encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

tables = ['interactions_review', 'interactions_wishlistitem']

for table in tables:
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT indexname, indexdef FROM pg_indexes WHERE tablename = '{table}'")
        print(f"Indexes for {table}:")
        rows = cursor.fetchall()
        if not rows:
            print(" - (None)")
        for row in rows:
            print(f" - {row[0]}: {row[1]}")
        print("-" * 40)

print("Done.")
