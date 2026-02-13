import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_connection(url, label):
    with open("test_db.log", "a") as f:
        f.write(f"\n--- Testing {label} ---\n")
        f.write(f"Host: {url.split('@')[-1]}\n")
        try:
            conn = psycopg2.connect(url)
            f.write("SUCCESS!\n")
            conn.close()
            return True
        except Exception as e:
            f.write(f"FAILED: {e}\n")
            return False

# Clear log
with open("test_db.log", "w") as f:
    f.write("DB CONNECTION TEST RESULTS\n")

# Try qualified username on Pooler 6543
url1 = os.getenv("DATABASE_URL")
test_connection(url1, "Qualified Username + Pooler 6543")

# Try qualified username on Pooler 5432
if url1:
    url2 = url1.replace(":6543/", ":5432/")
    test_connection(url2, "Qualified Username + Pooler 5432")

# Try project ref as dbname on Pooler 6543
url5 = "postgresql://postgres.lpuzoyordbojecpgupwm:Uif2ivVo11HHmQJ5@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
test_connection(url5, "Qualified User + Pooler 6543 (Double check)")

url6 = "postgresql://postgres:Uif2ivVo11HHmQJ5@aws-0-ap-south-1.pooler.supabase.com:6543/lpuzoyordbojecpgupwm?sslmode=require"
test_connection(url6, "Unqualified User + ProjectRef as DBName")

# Try project in options
url8 = "postgresql://postgres:Uif2ivVo11HHmQJ5@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&options=project%3Dlpuzoyordbojecpgupwm"
test_connection(url8, "Unqualified User + options=project (Pooler 6543)")

url9 = "postgresql://postgres.lpuzoyordbojecpgupwm:Uif2ivVo11HHmQJ5@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&options=project%3Dlpuzoyordbojecpgupwm"
test_connection(url9, "Qualified User + options=project (Pooler 6543)")

# Try direct host on pooler port
url10 = "postgresql://postgres:Uif2ivVo11HHmQJ5@db.lpuzoyordbojecpgupwm.supabase.co:6543/postgres?sslmode=require"
test_connection(url10, "Direct Host + Pooler Port 6543")
