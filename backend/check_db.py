import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute("SELECT id, name, primary_image FROM bikes_bikemodel WHERE name='Suzuki Gixxer 250'")
row = cursor.fetchone()
print(f"ID: {row[0]}")
print(f"Name: {row[1]}")
print(f"Primary Image stored in DB: {row[2]}")
conn.close()
