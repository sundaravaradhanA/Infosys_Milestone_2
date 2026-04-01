import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from app.database import Base, SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

print("Dropping bills and rewards if exists...")
with engine.connect() as conn:
    try:
        conn.execute("DROP TABLE bills;")
    except:
        pass
    try:
        conn.execute("DROP TABLE rewards;")
    except:
        pass
print("Done")
