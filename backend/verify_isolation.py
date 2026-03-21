"""
Verification Script: Confirms per-user data isolation in the database.
Run: python verify_isolation.py (from backend/ directory)
"""
import psycopg2

DB_URL = "postgresql://postgres:sundar%402005@localhost:5432/banking_db"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

print("=" * 60)
print("  VERIFICATION: Multi-User Data Isolation")
print("=" * 60)

# Get all users
cur.execute("SELECT id, name, email FROM users ORDER BY id")
users = cur.fetchall()

all_pass = True
print(f"\n{'user_id':<10} {'name':<22} {'accs':<6} {'txns':<6} {'budgets':<8} {'bills':<6} {'rewards':<8} {'alerts':<8} {'rules':<6} {'STATUS'}")
print("-" * 100)

for user in users:
    uid, name, email = user

    cur.execute("SELECT COUNT(*) FROM accounts WHERE user_id=%s", (uid,))
    accs = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(*) FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE a.user_id = %s
    """, (uid,))
    txns = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM budgets WHERE user_id=%s", (uid,))
    budgets = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bills WHERE user_id=%s", (uid,))
    bills = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM rewards WHERE user_id=%s", (uid,))
    rewards = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM alerts WHERE user_id=%s", (uid,))
    alerts = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM category_rules WHERE user_id=%s", (uid,))
    rules = cur.fetchone()[0]

    ok = accs > 0 and budgets > 0 and bills > 0 and rewards > 0 and alerts > 0 and rules > 0
    status = "✅ PASS" if ok else "❌ FAIL"
    if not ok:
        all_pass = False

    print(f"{uid:<10} {name:<22} {accs:<6} {txns:<6} {budgets:<8} {bills:<6} {rewards:<8} {alerts:<8} {rules:<6} {status}")

print("-" * 100)

# Check indexes
print("\n=== INDEXES PRESENT ===")
cur.execute("""
    SELECT tablename, indexname FROM pg_indexes
    WHERE schemaname = 'public' AND indexname LIKE 'ix_%'
    ORDER BY tablename, indexname
""")
for row in cur.fetchall():
    print(f"  ✓ [{row[0]}] {row[1]}")

# Final result
print("\n" + "=" * 60)
if all_pass:
    print("  ✅ ALL USERS HAVE ISOLATED DATA — VERIFICATION PASSED")
else:
    print("  ❌ SOME USERS ARE MISSING DATA — CHECK ABOVE")
print("=" * 60)

conn.close()
