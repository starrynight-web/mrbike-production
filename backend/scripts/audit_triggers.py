import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connections

def audit_triggers():
    conn = connections['default']
    print("\n--- Auditing Postgres Triggers ---")
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT event_object_table, trigger_name, event_manipulation, 
                   action_statement, action_timing
            FROM information_schema.triggers
            WHERE event_object_schema = 'public'
        """)
        triggers = cursor.fetchall()
        for t in triggers:
            print(f"Table: {t[0]}, Name: {t[1]}, Event: {t[2]}, Timing: {t[4]}")
            print(f"  Action: {t[3]}")

if __name__ == '__main__':
    audit_triggers()
