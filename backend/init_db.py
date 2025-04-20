from sqlalchemy import create_engine, text
import os
import time
from dotenv import load_dotenv
from database import Base, engine
from models import User, Organization, Project, Section, Document, AISuggestion, ComplianceCheck
from passlib.context import CryptContext
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

def init_db():
    logger.info("Creating database tables...")
    try:
        # Test connection before creating tables
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info(f"Database connection test: {result.fetchone()}")
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully!")
        
        # Verify tables were created
        with engine.connect() as conn:
            result = conn.execute(text("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"))
            tables = [row[0] for row in result.fetchall()]
            logger.info(f"Tables in database: {tables}")
            
            # Verify specific tables
            required_tables = ['users', 'organizations', 'projects', 'sections', 'documents']
            missing_tables = [table for table in required_tables if table not in tables]
            
            if missing_tables:
                logger.error(f"Missing tables: {missing_tables}")
                raise Exception(f"Tables not created properly: {missing_tables}")
            else:
                logger.info("All required tables found")
    
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def create_sample_data():
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if we already have users
        existing_user = db.query(User).first()
        if existing_user:
            logger.info("Sample data already exists, skipping creation.")
            return
        
        logger.info("Creating sample data...")
        
        # Create password hasher
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # Create a sample organization
        org = Organization(
            name="Demo Organization",
            mission="Improving education and environmental sustainability in underserved communities",
            tax_id="12-3456789",
            address="123 Main St, Anytown, USA 12345"
        )
        
        db.add(org)
        db.commit()
        db.refresh(org)
        logger.info(f"Organization created with ID: {org.id}")
        
        # Create a sample user
        user = User(
            username="demo",
            email="demo@example.com",
            hashed_password=pwd_context.hash("password"),
            organization_id=org.id,
            role="admin"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"User created with ID: {user.id}")
        
        # Create a sample project
        project = Project(
            title="Community Sustainability Program",
            description="A program to improve environmental sustainability in our community.",
            grant_type="environmental",
            status="draft",
            organization_id=org.id
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        logger.info(f"Project created with ID: {project.id}")
        
        # Add user to project
        project.users.append(user)
        db.commit()
        
        # Create sample sections
        sections = [
            Section(
                title="Project Overview",
                content="This project aims to improve environmental sustainability in our community through education and direct action.",
                order=1,
                project_id=project.id
            ),
            Section(
                title="Goals and Objectives",
                content="Our primary goal is to reduce carbon emissions by 15% in the community within the first year.",
                order=2,
                project_id=project.id
            ),
            Section(
                title="Implementation Plan",
                content="We will implement this program through workshops, community clean-up events, and partnerships with local schools.",
                order=3,
                project_id=project.id
            )
        ]
        
        for section in sections:
            db.add(section)
        
        db.commit()
        logger.info("Sample sections created")
        
        logger.info("Sample data created successfully!")
    
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        db.rollback()
    
    finally:
        db.close()

if __name__ == "__main__":
    max_attempts = 7  # Increased from 5 to 7
    retry_interval = 5
    
    for attempt in range(max_attempts):
        try:
            logger.info(f"Attempt {attempt + 1} of {max_attempts} to initialize database")
            init_db()
            create_sample_data()
            logger.info("Database initialization complete!")
            break
        
        except Exception as e:
            if attempt < max_attempts - 1:
                logger.error(f"Attempt {attempt + 1} failed: {e}")
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
                # Increment the retry interval for each attempt (backoff)
                retry_interval = min(retry_interval * 1.5, 30)  # Cap at 30 seconds
            else:
                logger.error(f"Maximum attempts reached. Database initialization failed: {e}")
                raise 