import os
import sqlite3
import psycopg2
import redis
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

def test_sqlite():
    print("--- Testing SQLite ---")
    db_path = Path("db.sqlite3")
    if not db_path.exists():
        print(f"[ERROR] SQLite file not found at {db_path}")
        return
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"[SUCCESS] SQLite Connection Successful! Found {len(tables)} tables.")
        conn.close()
    except Exception as e:
        print(f"[ERROR] SQLite Connection Failed: {e}")

def test_supabase():
    print("\n--- Testing Supabase (PostgreSQL) ---")
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("[INFO] DATABASE_URL not set in .env (Supabase is likely disabled)")
        return
    try:
        conn = psycopg2.connect(db_url)
        print("[SUCCESS] Supabase Connection Successful!")
        conn.close()
    except Exception as e:
        print(f"[ERROR] Supabase Connection Failed: {e}")

def test_redis():
    print("\n--- Testing Redis ---")
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        print("[ERROR] REDIS_URL not set in .env")
        return
    try:
        # Respect REDIS_SSL setting if it's there
        r_ssl = os.getenv("REDIS_SSL", "false").lower() == "true"
        url = redis_url
        if r_ssl and url.startswith("redis://"):
            url = url.replace("redis://", "rediss://", 1)
        
        r = redis.from_url(url, socket_timeout=5)
        r.ping()
        print(f"[SUCCESS] Redis Connection Successful! (Using: {url.split('@')[-1]})")
    except Exception as e:
        print(f"[ERROR] Redis Connection Failed: {e}")

def test_mongodb():
    print("\n--- Testing MongoDB Atlas ---")
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("[INFO] MONGODB_URI not set in .env")
        return
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("[SUCCESS] MongoDB Connection Successful!")
    except Exception as e:
        print(f"[ERROR] MongoDB Connection Failed: {e}")

if __name__ == "__main__":
    test_sqlite()
    test_supabase()
    test_redis()
    test_mongodb()
