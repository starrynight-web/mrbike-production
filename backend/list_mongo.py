import os
import pymongo
from dotenv import load_dotenv

load_dotenv()

def main():
    uri = os.getenv("MONGODB_URI")
    client = pymongo.MongoClient(uri)
    dbs = client.list_database_names()
    print(f"Databases on cluster: {dbs}")
    for db_name in dbs:
        if db_name in ['admin', 'config', 'local']:
            continue
        print(f"\n--- Checking database: {db_name} ---")
        db = client[db_name]
        try:
            cols = db.list_collection_names()
            for col in cols:
                count = db[col].count_documents({})
                if count > 0:
                    print(f"  - {col}: {count} records")
        except Exception as e:
            print(f"Error checking {db_name}: {e}")

if __name__ == "__main__":
    main()
