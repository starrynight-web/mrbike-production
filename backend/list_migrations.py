import os
import pymongo
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def check_mongo():
    uri = os.getenv("MONGODB_URI")
    client = pymongo.MongoClient(uri)
    db = client['mrbikebd']
    print("\n--- MongoDB Migrations (mrbikebd) ---")
    try:
        cursor = db['django_migrations'].find().sort('applied', 1)
        for r in cursor:
            print(f"  - {r.get('app')}: {r.get('name')} ({r.get('applied')})")
    except Exception as e:
        print(f"Error: {e}")

def check_postgres():
    url = os.getenv("DATABASE_URL")
    print("\n--- Postgres Migrations ---")
    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        cur.execute("SELECT app, name, applied FROM django_migrations ORDER BY applied ASC")
        for row in cur.fetchall():
            print(f"  - {row[0]}: {row[1]} ({row[2]})")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_mongo()
    check_postgres()
