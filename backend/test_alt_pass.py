import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# The one from MongoDB
alt_password = "wbCXigDIu2FuSQZd"
ref = "lpuzoyordbojecpgupwm"

def test_alt():
    host = "aws-0-ap-south-1.pooler.supabase.com"
    user = f"postgres.{ref}"
    db = "postgres"
    print(f"Testing {user}@{host}:6543/{db} with ALT PASSWORD...")
    try:
        url = f"postgresql://{user}:{alt_password}@{host}:6543/{db}?sslmode=require"
        conn = psycopg2.connect(url, connect_timeout=3)
        print("✅ SUCCESS with ALT PASSWORD!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Failed: {e}")
        return False

if __name__ == "__main__":
    test_alt()
