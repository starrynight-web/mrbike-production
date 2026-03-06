import psycopg2
import os

def test_old_db():
    # Legacy project from .env comments
    url = 'postgresql://postgres.lpuzoyordbojecpgupwm:Uif2ivVo11HHmQJ5@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'
    print(f"--- Testing Legacy Supabase (lpuzoyordbojecpgupwm) ---")
    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tables = [row[0] for row in cur.fetchall()]
        print(f"Tables: {tables}")
        for table in ['bikes_bikemodel', 'bikes_brand', 'marketplace_usedbikelisting']:
            if table in tables:
                cur.execute(f"SELECT COUNT(*) FROM \"{table}\"")
                print(f"  - {table}: {cur.fetchone()[0]} records")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Legacy DB Error: {e}")

if __name__ == "__main__":
    test_old_db()
