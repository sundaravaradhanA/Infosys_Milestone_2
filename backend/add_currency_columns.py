import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection details (from app/database.py)
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'banking_db'
DB_USER = 'postgres'
DB_PASS = 'sundar@2005'  # decoded

conn_string = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASS}"

print("Connecting to database...")
conn = psycopg2.connect(conn_string)
cur = conn.cursor(cursor_factory=RealDictCursor)

tables = [
    'transactions',
    'budgets', 
    'bills',
    'accounts'
]

for table in tables:
    sql = f"""
    ALTER TABLE {table} 
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD'
    """
    cur.execute(sql)
    print(f"✓ Added currency column to {table}")

# Update existing records to USD
for table in ['transactions', 'budgets', 'bills', 'accounts']:
    if table == 'accounts':
        col = 'balance'
    else:
        col = 'amount'
    sql = f"""
    UPDATE {table} 
    SET currency = 'USD' 
    WHERE currency IS NULL
    """
    cur.execute(sql)
    updated = cur.rowcount
    print(f"Updated {updated} {table} records to USD currency")

conn.commit()
cur.close()
conn.close()

print("✅ Migration complete! Restart backend server.")

