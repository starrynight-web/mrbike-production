import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def main():
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL not found.")
        return
    
    # Connect to the main 'postgres' db to list others
    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
        dbs = [row[0] for row in cur.fetchall()]
        print(f"Databases on cluster: {dbs}")
        cur.close()
        conn.close()
        
        for db_name in dbs:
            print(f"\n--- Checking database: {db_name} ---")
            try:
                # Replace the db name in the connection string
                # Handles both postgresql://user:pass@host:port/dbname and pooler variants
                # Simple replacement for testing
                if '/postgres' in url:
                    db_url = url.replace('/postgres', f'/{db_name}')
                else:
                    print(f"Could not easily replace db name in URL: {url}")
                    continue
                
                conn = psycopg2.connect(db_url)
                cur = conn.cursor()
                cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
                tables = [row[0] for row in cur.fetchall()]
                print(f"Tables: {len(tables)}")
                for t in tables:
                    cur.execute(f'SELECT COUNT(*) FROM "{t}"')
                    count = cur.fetchone()[0]
                    if count > 0:
                        print(f"  - {t}: {count} records")
                cur.close()
                conn.close()
            except Exception as e:
                print(f"Error checking {db_name}: {e}")
    except Exception as e:
        print(f"Error connecting to cluster: {e}")

if __name__ == "__main__":
    main()
