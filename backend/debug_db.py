import os
import psycopg2
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

# Test direct connection
db_url = os.getenv("DATABASE_URL")
print(f"DB URL: {db_url[:50]}...")

try:
    # Parse with dj_database_url like Django does
    config = dj_database_url.config(default=db_url)
    print(f"Parsed config: {config}")
    
    # Try direct psycopg2 connection
    conn = psycopg2.connect(db_url)
    print("✅ Direct connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ Failed: {e}")
