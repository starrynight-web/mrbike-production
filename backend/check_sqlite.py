import sqlite3
import os

def check_db(filename):
    if not os.path.exists(filename):
        print(f"File {filename} does not exist.")
        return
    print(f"--- Checking {filename} ---")
    try:
        conn = sqlite3.connect(filename)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cur.fetchall()]
        print(f"Total tables: {len(tables)}")
        for t in tables:
            try:
                cur.execute(f'SELECT COUNT(*) FROM "{t}"')
                count = cur.fetchone()[0]
                if count > 0:
                    print(f"  - {t}: {count} records")
            except Exception as e:
                # print(f"  - {t}: Error {e}")
                pass
        conn.close()
    except Exception as e:
        print(f"Error checking {filename}: {e}")

if __name__ == "__main__":
    check_db('db.sqlite3')
    check_db('db.sqlite3.BACKUP')
    check_db('db.sqlite3.LOCAL_BACKUP')
