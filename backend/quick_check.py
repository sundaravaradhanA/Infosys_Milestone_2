import psycopg2

DB_URL = "postgresql://postgres:sundar%402005@localhost:5432/banking_db"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("SELECT id, name, email FROM users ORDER BY id")
users = cur.fetchall()

print("user_id | accounts | budgets | bills | rewards | alerts | rules | STATUS")
for user in users:
    uid, name, email = user
    cur.execute("SELECT COUNT(*) FROM accounts WHERE user_id=%s", (uid,))
    accs = cur.fetchone()[0]
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
    status = "PASS" if ok else "FAIL"
    print(f"{uid} ({name[:15]}): accs={accs} budgets={budgets} bills={bills} rewards={rewards} alerts={alerts} rules={rules} -> {status}")

conn.close()
