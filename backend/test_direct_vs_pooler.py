import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

# Try direct connection (port 5432) instead of pooler (6543)  
project_ref = "lpuzoyordbojecpgupwm"
password = "Uif2ivVo11HHmQJ5"

# Direct connection
direct_url = f"postgresql://postgres.{project_ref}:{password}@db.{project_ref}.supabase.co:5432/postgres"

print("Testing DIRECT connection (port 5432)...")
try:
    conn = psycopg2.connect(direct_url)
    print("✅ DIRECT connection successful!")
    print(f"\nUse this URL:\n{direct_url}")
    conn.close()
except Exception as e:
    print(f"❌ Direct failed: {e}")

# Try pooler with session mode (port 5432)
session_url = f"postgresql://postgres.{project_ref}:{password}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

print("\nTesting SESSION MODE pooler (port 5432)...")
try:
    conn = psycopg2.connect(session_url)
    print("✅ SESSION MODE successful!")
    print(f"\nUse this URL:\n{session_url}")
    conn.close()
except Exception as e:
    print(f"❌ Session mode failed: {e}")
