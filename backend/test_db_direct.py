import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def test_direct():
    project_ref = "lpuzoyordbojecpgupwm"
    password = "Uif2ivVo11HHmQJ5"
    host = f"db.{project_ref}.supabase.co"
    print(f"Testing Direct Connection to {host}...")
    
    # Try different database names
    db_names = ["postgres", "mrbikebd"]
    
    for db_name in db_names:
        print(f"Trying DB: {db_name}...")
        try:
            url = f"postgresql://postgres:{password}@{host}:5432/{db_name}"
            conn = psycopg2.connect(url)
            print(f"✅ SUCCESS with {db_name}!")
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Failed with {db_name}: {e}")
    
    return False

if __name__ == "__main__":
    test_direct()
