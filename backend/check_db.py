import psycopg2

conn = psycopg2.connect("postgresql://postgres:sundar%402005@localhost:5432/banking_db")
cur = conn.cursor()

# List all tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
tables = cur.fetchall()
print("=== TABLES ===")
for t in tables:
    print(t[0])

# Check row counts per user per table
print("\n=== ROW COUNTS PER USER ===")
for t in tables:
    tname = t[0]
    try:
        cur.execute(f"SELECT COUNT(*) FROM {tname}")
        total = cur.fetchone()[0]
        # check if user_id column exists
        cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='{tname}' AND column_name='user_id'")
        has_uid = cur.fetchone()
        if has_uid:
            cur.execute(f"SELECT user_id, COUNT(*) FROM {tname} GROUP BY user_id ORDER BY user_id")
            rows = cur.fetchall()
            print(f"  {tname} (total={total}): per-user => {rows}")
        else:
            print(f"  {tname} (total={total}): no user_id column")
    except Exception as e:
        print(f"  {tname}: ERROR {e}")
        conn.rollback()

print("\n=== USERS ===")
cur.execute("SELECT id, name, email FROM users")
for row in cur.fetchall():
    print(f"  id={row[0]}, name={row[1]}, email={row[2]}")

print("\n=== ACCOUNTS ===")
cur.execute("SELECT id, user_id, bank_name, account_type, balance FROM accounts")
for row in cur.fetchall():
    print(f"  id={row[0]}, user_id={row[1]}, bank={row[2]}, type={row[3]}, balance={row[4]}")

print("\n=== CONSTRAINTS & INDEXES ===")
cur.execute("""
    SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type
""")
for row in cur.fetchall():
    print(f"  {row[0]} | {row[2]} | {row[1]} | {row[3]}")

conn.close()
print("\nDone.")
