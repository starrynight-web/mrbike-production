import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def test_config(name, url):
    print(f"Testing {name}...")
    try:
        conn = psycopg2.connect(url)
        print(f"✅ {name} Successful!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ {name} Failed: {e}")
        return False

if __name__ == "__main__":
    db_url = os.getenv("DATABASE_URL")
    # Try 5432 instead of 6543
    url_5432 = db_url.replace(":6543/", ":5432/")
    test_config("Port 5432", url_5432)
    
    # Try without the Ref prefix in username
    # postgres.lpuzoyordbojecpgupwm -> postgres
    # But usually Supabase REQUIRES the project ref in the username for the pooler.
    
    # Try common DB name: mrbikebd
    url_mrbikebd = db_url.replace("/postgres", "/mrbikebd")
    test_config("DB Name mrbikebd", url_mrbikebd)
    
    # Try without pooler (direct IP/hostname if known)
    # The pooler host is aws-0-ap-south-1.pooler.supabase.com
    # Usually the direct host is [project-ref].supabase.co
    project_ref = "lpuzoyordbojecpgupwm"
    direct_host = f"{project_ref}.supabase.co"
    direct_url = f"postgresql://postgres:{os.getenv('MONGODB_PASSWORD')}@{direct_host}:5432/mrbikebd" # Wait, I don't have the DB password separate?
    # Actually, the password is in the current DATABASE_URL
    pass_part = "Uif2ivVo11HHmQJ5"
    direct_url = f"postgresql://postgres:{pass_part}@{direct_host}:5432/postgres"
    test_config("Direct (project-ref.supabase.co)", direct_url)
