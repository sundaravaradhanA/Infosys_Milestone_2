import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port="5432",
    database="banking_db",
    user="postgres",
    password="sundar@2005"
)

cur = conn.cursor()

try:
    cur.execute("ALTER TABLE users ADD COLUMN address VARCHAR;")
    conn.commit()
    print("Column 'address' added successfully!")
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()

cur.close()
conn.close()
