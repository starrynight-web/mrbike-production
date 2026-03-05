import psycopg2
try:
    conn = psycopg2.connect(dbname='postgres', user='postgres.yaeqtrdkyrspeopfdkvi', password='mrbike56785432', host='aws-1-ap-southeast-1.pooler.supabase.com', port='6543', sslmode='require')
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS \"Users\" CASCADE;")
    cur.execute("DROP TABLE IF EXISTS \"django_migrations\" CASCADE;")
    cur.execute("DROP TABLE IF EXISTS \"django_content_type\" CASCADE;")
    cur.execute("DROP TABLE IF EXISTS \"auth_permission\" CASCADE;")
    cur.execute("DROP TABLE IF EXISTS \"auth_group\" CASCADE;")
    cur.execute("DROP TABLE IF EXISTS \"auth_group_permissions\" CASCADE;")
    conn.commit()
    print("[OK] Database cleaned!")
    conn.close()
except Exception as e:
    print(f"[ERROR] {e}")
