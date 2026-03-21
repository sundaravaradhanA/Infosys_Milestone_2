"""
Diagnose: Check transaction categories vs budget categories for all users
"""
import psycopg2

DB_URL = "postgresql://postgres:sundar%402005@localhost:5432/banking_db"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

print("=== BUDGET CATEGORIES per user ===")
cur.execute("""
    SELECT user_id, category, month, limit_amount, spent_amount
    FROM budgets ORDER BY user_id, category
""")
for row in cur.fetchall():
    print(f"  user={row[0]}, cat='{row[1]}', month={row[2]}, limit={row[3]}, spent_stored={row[4]}")

print("\n=== TRANSACTION CATEGORIES (distinct) for user_id=1 ===")
cur.execute("""
    SELECT DISTINCT t.category, COUNT(*) as cnt, SUM(t.amount) as total
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = 1
    GROUP BY t.category
    ORDER BY t.category
""")
for row in cur.fetchall():
    print(f"  category='{row[0]}', count={row[1]}, total={row[2]}")

print("\n=== SAMPLE TRANSACTIONS for user_id=1 ===")
cur.execute("""
    SELECT t.id, t.description, t.category, t.amount, t.created_at
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = 1
    ORDER BY t.created_at DESC
    LIMIT 20
""")
for row in cur.fetchall():
    print(f"  id={row[0]}, desc='{row[1]}', cat='{row[2]}', amount={row[3]}, date={row[4].strftime('%Y-%m-%d')}")

print("\n=== WHAT BUDGET SPENDING QUERY RETURNS for user_id=1, month=2026-03 ===")
cur.execute("""
    SELECT b.category, 
           COALESCE(SUM(ABS(t.amount)), 0) as actual_spent
    FROM budgets b
    LEFT JOIN accounts a ON a.user_id = b.user_id
    LEFT JOIN transactions t ON t.account_id = a.id 
        AND t.category = b.category 
        AND t.amount < 0
        AND TO_CHAR(t.created_at, 'YYYY-MM') = b.month
    WHERE b.user_id = 1
    GROUP BY b.category
    ORDER BY b.category
""")
for row in cur.fetchall():
    print(f"  budget_cat='{row[0]}', actual_spent_from_txns={row[1]}")

conn.close()
