from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
from sqlalchemy import text

DATABASE_URL = "postgresql://myuser:mypassword@localhost:5432/notesdb"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_admin_column():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE user_info ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false"))
            conn.commit()
            print("Column 'is_admin' added successfully")
        except Exception as e:
            print(f"Error adding column: {e}")


def init_db():
    Base.metadata.create_all(bind=engine)






