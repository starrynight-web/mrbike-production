import os
import pymongo
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_mongo():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DATABASE", "mrbikebd")
    print(f"--- Testing MongoDB ({db_name}) ---")
    try:
        client = pymongo.MongoClient(uri)
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        for coll in collections:
            count = db[coll].count_documents({})
            print(f"  - {coll}: {count} records")
    except Exception as e:
        print(f"MongoDB Error: {e}")

def test_postgres():
    url = os.getenv("DATABASE_URL")
    print(f"--- Testing Postgres ---")
    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        tables = [row[0] for row in cur.fetchall()]
        print(f"Tables: {tables}")
        for table in tables:
            try:
                cur.execute(f"SELECT COUNT(*) FROM \"{table}\"")
                print(f"  - {table}: {cur.fetchone()[0]} records")
            except Exception as e:
                print(f"  - {table}: Error {e}")
                conn.rollback()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Postgres Error: {e}")

if __name__ == "__main__":
    test_mongo()
    test_postgres()
