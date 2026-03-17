import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to DB...")

def run_cleanup():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        with conn.cursor() as cur:
            target = 'mrbikecloude@gmail.com'
            print(f"Target Admin: {target}")
            
            # 1. Get user IDs to purge
            cur.execute("SELECT id FROM users_user WHERE email != %s", (target,))
            purge_ids = [r[0] for r in cur.fetchall()]
            print(f"Purge User IDs: {purge_ids}")
            
            if not purge_ids:
                print("No users to purge.")
                return

            id_list = ",".join(map(str, purge_ids))

            batches = [
                ("news_article", f"author_id IN ({id_list})"),
                ("interactions_review", f"user_id IN ({id_list})"),
                ("interactions_wishlistitem", f"wishlist_id IN (SELECT id FROM interactions_wishlist WHERE user_id IN ({id_list}))"),
                ("interactions_wishlist", f"user_id IN ({id_list})"),
                ("users_notification", f"user_id IN ({id_list})"),
                ("users_userprofile", f"user_id IN ({id_list})"),
                ("users_emailverificationtoken", f"user_id IN ({id_list})"),
                ("marketplace_listingimage", f"listing_id IN (SELECT id FROM marketplace_usedbikelisting WHERE seller_id IN ({id_list}))"),
                ("marketplace_reportlisting", f"user_id IN ({id_list})"),
                ("marketplace_reportlisting", f"listing_id IN (SELECT id FROM marketplace_usedbikelisting WHERE seller_id IN ({id_list}))"),
                ("marketplace_usedbikelisting", f"seller_id IN ({id_list})"),
                ("django_q_task", f"id IS NOT NULL"), # Just clear queue to be safe if it's stale
                ("django_q_schedule", f"id IS NOT NULL"), # Clear schedules too
            ]
            
            for table, where in batches:
                try:
                    print(f"Purging {table}...")
                    cur.execute(f"DELETE FROM {table} WHERE {where}")
                    print(f" - Rows deleted: {cur.rowcount}")
                except Exception as e:
                    print(f" - Skip {table} (Error: {str(e).splitlines()[0]})")
            
            print("Finalizing User Cleanup...")
            # Delete legacy admins
            cur.execute("DELETE FROM users_user WHERE email != %s AND is_superuser = True", (target,))
            print(f" - Deleted legacy superusers: {cur.rowcount}")
            
            # Demote everyone else (regular users remain as regular users)
            cur.execute("UPDATE users_user SET is_staff = False, is_superuser = False WHERE email != %s", (target,))
            print(f" - Demoted other staff: {cur.rowcount}")
            
        conn.close()
        print("Done.")
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    run_cleanup()
