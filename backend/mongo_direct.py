import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "mrbikebd")

if not MONGODB_URI:
    print("MONGODB_URI not found in environment")
    exit(1)

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

print(f"Connected to MongoDB: {DATABASE_NAME}")

collections = db.list_collection_names()
print(f"Collections: {collections}")

for coll_name in collections:
    count = db[coll_name].count_documents({})
    print(f" - {coll_name}: {count}")
    if count > 0:
        sample = db[coll_name].find_one()
        print(f"   Sample: {sample}")

client.close()
