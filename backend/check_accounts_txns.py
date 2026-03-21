import psycopg2

conn = psycopg2.connect("postgresql://postgres:sundar%402005@localhost:5432/banking_db")
cur = conn.cursor()

print("=== TRANSACTIONS per ACCOUNT (with user_id) ===")
cur.execute("""
    SELECT a.user_id, a.id as account_id, a.bank_name, COUNT(t.id) as txn_count
    FROM accounts a
    LEFT JOIN transactions t ON t.account_id = a.id
    GROUP BY a.user_id, a.id, a.bank_name
    ORDER BY a.user_id
""")
for row in cur.fetchall():
    print(f"  user_id={row[0]}, account_id={row[1]}, bank={row[2]}, transactions={row[3]}")

print("\n=== INDEXES ON ALL TABLES ===")
cur.execute("""
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
""")
for row in cur.fetchall():
    print(f"  [{row[0]}] {row[1]}: {row[2]}")

conn.close()
print("\nDone.")
