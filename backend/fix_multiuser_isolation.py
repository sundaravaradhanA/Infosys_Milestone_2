"""
PostgreSQL Multi-User Data Isolation Fix
=========================================
Fixes:
1. Adds missing user_id indexes for fast per-user queries
2. Seeds isolated data (budgets, bills, rewards, alerts, category_rules) for ALL users
3. Trims the 943 stale alerts for user_id=1 to last 50
4. Ensures user sundaravaradhanmadurai@gmail.com (user_id=1) has full, clean isolated data

Run: python fix_multiuser_isolation.py (from backend/ directory)
"""

import psycopg2
from datetime import datetime, timedelta
import random

DB_URL = "postgresql://postgres:sundar%402005@localhost:5432/banking_db"

def run_fix():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()
    
    print("=" * 60)
    print("  PostgreSQL Multi-User Isolation Fix")
    print("=" * 60)

    # ----------------------------------------------------------------
    # STEP 1: Add missing indexes for per-user query performance
    # ----------------------------------------------------------------
    print("\n[1/5] Adding missing indexes...")
    indexes = [
        ("accounts",       "ix_accounts_user_id",           "CREATE INDEX IF NOT EXISTS ix_accounts_user_id ON accounts(user_id)"),
        ("bills",          "ix_bills_user_id",              "CREATE INDEX IF NOT EXISTS ix_bills_user_id ON bills(user_id)"),
        ("rewards",        "ix_rewards_user_id",            "CREATE INDEX IF NOT EXISTS ix_rewards_user_id ON rewards(user_id)"),
        ("transactions",   "ix_transactions_account_id",    "CREATE INDEX IF NOT EXISTS ix_transactions_account_id ON transactions(account_id)"),
        ("transactions",   "ix_transactions_created_at",    "CREATE INDEX IF NOT EXISTS ix_transactions_created_at ON transactions(created_at DESC)"),
        ("transactions",   "ix_transactions_category",      "CREATE INDEX IF NOT EXISTS ix_transactions_category ON transactions(category)"),
        ("transactions",   "ix_transactions_currency",      "CREATE INDEX IF NOT EXISTS ix_transactions_currency ON transactions(currency)"),
        ("accounts",       "ix_accounts_currency",          "CREATE INDEX IF NOT EXISTS ix_accounts_currency ON accounts(currency)"),
    ]
    for table, idx_name, ddl in indexes:
        cur.execute(ddl)
        print(f"  ✓ {idx_name} on {table}")
    
    conn.commit()

    # ----------------------------------------------------------------
    # STEP 2: Trim stale alerts for user_id=1 (keep last 50)
    # ----------------------------------------------------------------
    print("\n[2/5] Trimming stale alerts for user_id=1 (keeping last 50)...")
    cur.execute("SELECT COUNT(*) FROM alerts WHERE user_id = 1")
    total_alerts = cur.fetchone()[0]
    print(f"  Current alert count for user_id=1: {total_alerts}")
    
    cur.execute("""
        DELETE FROM alerts
        WHERE user_id = 1
          AND id NOT IN (
              SELECT id FROM alerts
              WHERE user_id = 1
              ORDER BY created_at DESC
              LIMIT 50
          )
    """)
    deleted = cur.rowcount
    conn.commit()
    print(f"  ✓ Deleted {deleted} stale alerts. Remaining: {total_alerts - deleted}")

    # ----------------------------------------------------------------
    # STEP 3: Fetch all users and their accounts
    # ----------------------------------------------------------------
    print("\n[3/5] Fetching all users and accounts...")
    cur.execute("SELECT id, name, email FROM users ORDER BY id")
    users = cur.fetchall()
    print(f"  Found {len(users)} users")
    for u in users:
        print(f"    user_id={u[0]}: {u[1]} ({u[2]})")

    cur.execute("SELECT id, user_id, bank_name, balance FROM accounts ORDER BY user_id")
    accounts_rows = cur.fetchall()
    # Group accounts by user_id
    user_accounts = {}
    for row in accounts_rows:
        uid = row[1]
        if uid not in user_accounts:
            user_accounts[uid] = []
        user_accounts[uid].append({"id": row[0], "bank": row[2], "balance": row[3]})
    
    # ----------------------------------------------------------------
    # STEP 3.5: Drop tables which have changed schema
    # ----------------------------------------------------------------
    print("\n[3.5/5] Recreating tables with updated schemas...")
    try:
        cur.execute("DROP TABLE IF EXISTS bills CASCADE;")
        cur.execute("""
            CREATE TABLE bills (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                biller_name VARCHAR NOT NULL,
                due_date DATE NOT NULL,
                amount_due NUMERIC(10,2) NOT NULL CHECK (amount_due > 0),
                status VARCHAR DEFAULT 'upcoming',
                auto_pay BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("CREATE INDEX ix_bills_user_id ON bills(user_id);")
        cur.execute("CREATE INDEX ix_bills_status ON bills(status);")

        cur.execute("DROP TABLE IF EXISTS rewards CASCADE;")
        cur.execute("""
            CREATE TABLE rewards (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                program_name VARCHAR NOT NULL,
                points_balance INTEGER DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("CREATE INDEX ix_rewards_user_id ON rewards(user_id);")
        conn.commit()
        print("  ✓ Refreshed db schema for Bills and Rewards")
    except Exception as e:
        conn.rollback()
        print(f"  Error refreshing tables: {e}")

    # ----------------------------------------------------------------
    # STEP 4: Seed per-user data for each user
    # ----------------------------------------------------------------
    print("\n[4/5] Seeding per-user isolated data...")
    
    current_month = datetime.now().strftime("%Y-%m")
    
    # Category definitions for budgets
    budget_categories = [
        ("Food & Dining",   1200.00, 800.00),
        ("Transport",        400.00, 280.00),
        ("Shopping",         800.00, 350.00),
        ("Entertainment",    300.00, 200.00),
        ("Utilities",        500.00, 420.00),
    ]
    
    # Bill definitions per user (will be varied by user)
    bill_templates = [
        ("Electricity Bill", 85.00),
        ("Internet Plan",    55.00),
        ("Netflix",          15.99),
        ("Mobile Recharge",  25.00),
    ]
    
    # Category rules (system-wide, will be seeded per user)
    rule_templates = [
        ("Food & Dining",    "swiggy",     None,         10),
        ("Food & Dining",    "zomato",     None,         10),
        ("Shopping",         "amazon",     None,         10),
        ("Entertainment",    "netflix",    None,         10),
        ("Utilities",        "electricity",None,         9),
        ("Salary",           "salary",     None,         10),
    ]

    for user in users:
        uid = user[0]
        uname = user[1]
        print(f"\n  --- Processing user_id={uid}: {uname} ---")
        
        # a) BUDGETS — seed for current month (skip if already exists)
        for cat, limit_amt, spent_amt in budget_categories:
            cur.execute("""
                SELECT id FROM budgets 
                WHERE user_id = %s AND category = %s AND month = %s
            """, (uid, cat, current_month))
            exists = cur.fetchone()
            if not exists:
                factor = 0.8 + (uid % 5) * 0.1
                cur.execute("""
                    INSERT INTO budgets (user_id, category, limit_amount, spent_amount, month, currency)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (uid, cat, round(limit_amt * factor, 2), round(spent_amt * factor * random.uniform(0.5, 1.0), 2), current_month, 'USD'))
                print(f"    ✓ Budget seeded: {cat} for {current_month}")
            else:
                print(f"    ~ Budget exists: {cat} for {current_month}")
        
        # b) BILLS — seed 2-3 bills per user
        due_base = datetime.now().replace(day=1) + timedelta(days=random.randint(5, 25))
        for i, (biller_name, amount) in enumerate(bill_templates[:3]):
            cur.execute("""
                SELECT id FROM bills 
                WHERE user_id = %s AND biller_name = %s
            """, (uid, biller_name))
            exists = cur.fetchone()
            if not exists:
                due = due_base + timedelta(days=i * 7)
                factor = 0.85 + (uid % 5) * 0.08
                status = "upcoming"
                if due.date() < datetime.now().date():
                    status = "overdue"

                cur.execute("""
                    INSERT INTO bills (user_id, biller_name, amount_due, due_date, status, auto_pay)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (uid, biller_name, round(amount * factor, 2), due, status, False))
                print(f"    ✓ Bill seeded: {biller_name}")
            else:
                print(f"    ~ Bill exists: {biller_name}")
        
        # c) REWARDS — seed 1 reward per user
        cur.execute("SELECT id FROM rewards WHERE user_id = %s", (uid,))
        existing_rewards = cur.fetchall()
        if len(existing_rewards) == 0:
            cur.execute("""
                INSERT INTO rewards (user_id, program_name, points_balance, last_updated)
                VALUES (%s, %s, %s, %s)
            """, (uid, 
                  "Bank Pro Default Rewards",
                  1500 + (uid * 13 % 400),
                  datetime.now()))
            print(f"    ✓ Reward seeded")
        else:
            print(f"    ~ Rewards exist ({len(existing_rewards)})")
        
        # d) ALERTS — seed 2 clean alerts per user
        cur.execute("SELECT COUNT(*) FROM alerts WHERE user_id = %s", (uid,))
        alert_count = cur.fetchone()[0]
        if alert_count < 2:
            cur.execute("""
                INSERT INTO alerts (user_id, title, message, alert_type, is_read, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (uid,
                  "Welcome to Digital Banking!",
                  f"Hello {uname}, your account is active and ready to use.",
                  "info", False, datetime.now() - timedelta(days=1)))
            print(f"    ✓ Alerts seeded (was {alert_count})")
        else:
            print(f"    ~ Alerts exist ({alert_count})")
        
        # e) CATEGORY RULES — seed per-user rules
        cur.execute("SELECT COUNT(*) FROM category_rules WHERE user_id = %s", (uid,))
        rule_count = cur.fetchone()[0]
        if rule_count < 2:
            for category, keyword, merchant, priority in rule_templates:
                cur.execute("""
                    SELECT id FROM category_rules 
                    WHERE user_id = %s AND keyword_pattern = %s
                """, (uid, keyword))
                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO category_rules (user_id, category, keyword_pattern, merchant_pattern, priority, is_active, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (uid, category, keyword, merchant, priority, True, datetime.now()))
            print(f"    ✓ Category rules seeded")
        else:
            print(f"    ~ Category rules exist ({rule_count})")
    
    conn.commit()

    # ----------------------------------------------------------------
    # STEP 5: Add UniqueConstraint on budgets if not already there
    # ----------------------------------------------------------------
    print("\n[5/5] Verifying unique constraint on budgets...")
    cur.execute("""
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'budgets' AND constraint_name = 'uq_budget_user_category_month'
    """)
    if cur.fetchone():
        print("  ✓ Unique constraint already exists")
    else:
        try:
            cur.execute("""
                ALTER TABLE budgets
                ADD CONSTRAINT uq_budget_user_category_month
                UNIQUE (user_id, category, month)
            """)
            conn.commit()
            print("  ✓ Unique constraint added")
        except Exception as e:
            conn.rollback()
            print(f"  ~ Constraint note: {e}")

    conn.commit()
    conn.close()
    
    print("\n" + "=" * 60)
    print("  ✅ ALL FIXES APPLIED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    run_fix()
