from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
import time
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/autodraft"
)

# Function to retry database connection
def get_engine(url, max_retries=5, retry_interval=5):
    """Get database engine with retry logic for container startup"""
    retries = 0
    while retries < max_retries:
        try:
            print(f"Attempting to connect to database: {url.split('@')[1]}")
            engine = create_engine(url)
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Database connection successful!")
            return engine
        except Exception as e:
            retries += 1
            print(f"Database connection attempt {retries} failed: {e}")
            if retries < max_retries:
                print(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                print("Max retries reached. Could not connect to database.")
                raise
            
# Get engine with retry logic
engine = get_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 