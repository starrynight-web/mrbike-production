import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

password = "Uif2ivVo11HHmQJ5"
ref = "lpuzoyordbojecpgupwm"

hosts = [
    f"db.{ref}.supabase.co",
    f"{ref}.supabase.co",
    "aws-0-ap-south-1.pooler.supabase.com"
]

ports = ["5432", "6543"]

usernames = [
    "postgres",
    f"postgres.{ref}"
]

db_names = ["postgres", ref, "mrbikebd"]

def test():
    for host in hosts:
        for port in ports:
            for user in usernames:
                for db in db_names:
                    label = f"{user}@{host}:{port}/{db}"
                    print(f"Testing {label}...", end=" ")
                    try:
                        url = f"postgresql://{user}:{password}@{host}:{port}/{db}?sslmode=require"
                        conn = psycopg2.connect(url, connect_timeout=3)
                        print("✅ SUCCESS!")
                        conn.close()
                        return url
                    except Exception as e:
                        msg = str(e).split('\n')[0]
                        print(f"❌ {msg}")
    return None

if __name__ == "__main__":
    result = test()
    if result:
        print(f"\nWORKING URL: {result}")
    else:
        print("\nNo working combination found.")
