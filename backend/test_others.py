import os
from pymongo import MongoClient
import redis
from dotenv import load_dotenv

load_dotenv()

def test_mongodb():
    uri = os.getenv("MONGODB_URI")
    print(f"\n--- Testing MongoDB ---")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("SUCCESS!")
    except Exception as e:
        print(f"FAILED: {e}")

def test_redis():
    url = os.getenv("REDIS_URL")
    print(f"\n--- Testing Redis ---")
    try:
        r = redis.from_url(url)
        r.ping()
        print("SUCCESS!")
    except Exception as e:
        print(f"FAILED: {e}")

test_mongodb()
test_redis()
