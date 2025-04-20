import os
import sys
from sqlalchemy import create_engine, text, Column, Text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Get the database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/autodraft")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_project_metadata_column():
    """Add project_metadata column to projects table if it doesn't exist."""
    inspector = inspect(engine)
    
    # Check if projects table exists
    if "projects" not in inspector.get_table_names():
        print("Projects table not found. Database may not be initialized.")
        return
    
    # Get columns in projects table
    columns = [col["name"] for col in inspector.get_columns("projects")]
    
    # Check if project_metadata column exists
    if "project_metadata" not in columns:
        print("Adding project_metadata column to projects table...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE projects ADD COLUMN project_metadata TEXT"))
        print("Column added successfully.")
    else:
        print("project_metadata column already exists.")

def check_database_connection():
    """Check if we can connect to the database."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("Database connection successful.")
            return True
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("Checking database connection...")
    if check_database_connection():
        print("Running migrations...")
        add_project_metadata_column()
        print("Migrations completed.")
    else:
        print("Migration failed due to database connection issues.") 