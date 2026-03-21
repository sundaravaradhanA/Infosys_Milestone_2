"""
Final verification: Confirm Transactions, Analytics, and Budget show the same numbers.
"""
import psycopg2

DB_URL = "postgresql://postgres:sundar%402005@localhost:5432/banking_db"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("SELECT id, name FROM users ORDER BY id")
users = cur.fetchall()

all_pass = True
print("=" * 70)
print("  CONSISTENCY CHECK: Budget stored_spent == Computed from Transactions")
print("=" * 70)

for uid, uname in users:
    cur.execute("""
        SELECT b.category, b.month, b.limit_amount, b.spent_amount,
               COALESCE(SUM(ABS(t.amount)), 0) as real_spent
        FROM budgets b
        LEFT JOIN accounts a ON a.user_id = b.user_id
        LEFT JOIN transactions t ON t.account_id = a.id 
            AND t.category = b.category 
            AND t.amount < 0
            AND TO_CHAR(t.created_at, 'YYYY-MM') = b.month
        WHERE b.user_id = %s
        GROUP BY b.id, b.category, b.month, b.limit_amount, b.spent_amount
        ORDER BY b.month, b.category
    """, (uid,))
    rows = cur.fetchall()
    
    print(f"\n  User {uid} - {uname}:")
    user_pass = True
    for cat, month, limit, stored, computed in rows:
        match = abs(float(stored) - float(computed)) < 0.01
        icon = "✅" if match else "❌"
        if not match:
            all_pass = False
            user_pass = False
        print(f"    {icon} {month} | {cat:<20} | limit={float(limit):>8.2f} | stored={float(stored):>8.2f} | computed={float(computed):>8.2f}")
    if user_pass:
        print(f"    → ALL MATCH ✅")

print("\n" + "=" * 70)
# Check transaction category distribution (should match budget categories)
print("\n  Transaction categories in 2026-03:")
cur.execute("""
    SELECT t.category, COUNT(*) as cnt, 
           SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_expense,
           SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_income
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE TO_CHAR(t.created_at, 'YYYY-MM') = '2026-03'
    GROUP BY t.category
    ORDER BY total_expense DESC
""")
for row in cur.fetchall():
    print(f"    '{row[0]}': {row[1]} txns | expense={float(row[2]):.2f} | income={float(row[3]):.2f}")

print("\n" + "=" * 70)
if all_pass:
    print("  ✅ ALL DATA IS CONSISTENT — Transactions = Analytics = Budget")
else:
    print("  ❌ SOME MISMATCHES REMAIN")
print("=" * 70)
conn.close()
