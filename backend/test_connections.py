import os
import psycopg2
import redis
from dotenv import load_dotenv

load_dotenv()

def test_db():
    print("Testing Supabase Connection...")
    db_url = os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(db_url)
        print("✅ Supabase Connection Successful!")
        conn.close()
    except Exception as e:
        print(f"❌ Supabase Connection Failed: {e}")

def test_redis():
    print("\nTesting Redis Connection...")
    redis_url = os.getenv("REDIS_URL")
    try:
        # Try both with and without SSL if it fails
        r = redis.from_url(redis_url, decode_responses=True)
        r.ping()
        print("✅ Redis Connection Successful!")
    except Exception as e:
        print(f"❌ Redis Connection Failed: {e}")
        print("Trying without SSL in URL...")
        try:
            non_ssl_url = redis_url.replace("rediss://", "redis://")
            r = redis.from_url(non_ssl_url, decode_responses=True)
            r.ping()
            print("✅ Redis Connection Successful (without SSL)!")
        except Exception as e2:
            print(f"❌ Redis Connection Failed (again): {e2}")

if __name__ == "__main__":
    test_db()
    test_redis()
