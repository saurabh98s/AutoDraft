import psycopg2
import os
import time
import uuid
import logging
from datetime import datetime
from dotenv import load_dotenv
from passlib.context import CryptContext

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

DB_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/autodraft"
)

def get_db_connection():
    """Get a database connection"""
    try:
        # Log connection attempt without sensitive information
        db_parts = DB_URL.split('@')
        safe_conn_info = db_parts[1] if len(db_parts) > 1 else 'unknown'
        logger.info(f"Connecting to database: {safe_conn_info}")
        
        # Connect using the connection string
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return False

def create_schema():
    """Create the database schema if it doesn't exist."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("Could not establish database connection")
            return False
            
        cursor = conn.cursor()
        
        # Create the organizations table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        logger.info("Creating database tables...")
        
        # Create tables
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            organization_id VARCHAR(36) REFERENCES organizations(id),
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            grant_type VARCHAR(50) DEFAULT 'standard',
            organization_id VARCHAR(36) REFERENCES organizations(id) NOT NULL,
            status VARCHAR(20) DEFAULT 'draft',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS project_users (
            project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
            user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (project_id, user_id)
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS sections (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            order_number INTEGER,
            project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            title VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            document_type VARCHAR(50) NOT NULL,
            project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_suggestions (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            content TEXT,
            section_id VARCHAR(36) REFERENCES sections(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS compliance_checks (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
            project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
            check_type VARCHAR(50) NOT NULL,
            result TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        ''')
        
        conn.commit()
        
        logger.info("Database schema created successfully")
        
        # Verify tables were created
        cursor.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        """)
        tables = [row[0] for row in cursor.fetchall()]
        logger.info(f"Tables in database: {tables}")
        
        return True
    except Exception as e:
        logger.error(f"Error creating schema: {e}")
        if conn is not None:
            conn.rollback()
        return False
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

def create_sample_data():
    """Create sample data in the database."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("Could not establish database connection")
            return False
            
        cursor = conn.cursor()
        
        # Check if we already have an organization
        cursor.execute("SELECT COUNT(*) FROM organizations")
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Add a sample organization
            cursor.execute("""
            INSERT INTO organizations (name)
            VALUES ('Demo Organization')
            RETURNING id
            """)
            org_id = cursor.fetchone()[0]
            logger.info(f"Created demo organization with ID: {org_id}")

        # Check if we already have sample data
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        
        if count > 0:
            logger.info("Sample data already exists, skipping creation")
            return True
            
        logger.info("Creating sample data...")
        
        # Create a password hasher
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash("password123")
        
        # Create sample users
        user_ids = []
        for i, (username, email, role) in enumerate([
            ("admin", "admin@greenearthfoundation.org", "admin"),
            ("john", "john@greenearthfoundation.org", "editor"),
            ("maria", "maria@greenearthfoundation.org", "user")
        ]):
            user_id = str(uuid.uuid4())
            cursor.execute('''
            INSERT INTO users (id, username, email, hashed_password, organization_id, role)
            VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                user_id,
                username,
                email,
                hashed_password,
                org_id,
                role
            ))
            user_ids.append(user_id)
            logger.info(f"Created user {username} with ID: {user_id}")
        
        # Create sample projects
        projects = [
            {
                "id": str(uuid.uuid4()),
                "title": "Urban Reforestation Initiative",
                "description": "A project to plant 10,000 trees in urban areas to improve air quality and provide green spaces.",
                "grant_type": "environmental",
                "status": "in_progress"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Clean Water Access Program",
                "description": "Providing clean water solutions to underserved communities through sustainable technology.",
                "grant_type": "infrastructure",
                "status": "draft"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Renewable Energy Education",
                "description": "Educational program teaching communities about renewable energy technologies and implementation.",
                "grant_type": "education",
                "status": "submitted"
            }
        ]
        
        for project in projects:
            cursor.execute('''
            INSERT INTO projects (id, title, description, grant_type, organization_id, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                project["id"],
                project["title"],
                project["description"],
                project["grant_type"],
                org_id,
                project["status"]
            ))
            logger.info(f"Created project {project['title']} with ID: {project['id']}")
            
            # Assign all users to this project
            for user_id in user_ids:
                cursor.execute('''
                INSERT INTO project_users (project_id, user_id)
                VALUES (%s, %s)
                ''', (project["id"], user_id))
            
            # Add sections for the first project
            if project["title"] == "Urban Reforestation Initiative":
                sections = [
                    {
                        "title": "Executive Summary",
                        "content": "The Urban Reforestation Initiative aims to plant 10,000 trees in urban areas over the next two years. This project will improve air quality, provide green spaces for communities, and help combat climate change at the local level.",
                        "order_number": 1
                    },
                    {
                        "title": "Project Goals",
                        "content": "1. Plant 10,000 native trees in urban areas\n2. Reduce local temperature by 2°C in targeted areas\n3. Engage 5,000 community volunteers\n4. Establish 20 new urban mini-forests\n5. Create a sustainable maintenance program",
                        "order_number": 2
                    },
                    {
                        "title": "Implementation Plan",
                        "content": "Phase 1 (Months 1-3): Site selection and community outreach\nPhase 2 (Months 4-12): First planting season - 5,000 trees\nPhase 3 (Months 13-18): Monitoring and maintenance\nPhase 4 (Months 19-24): Second planting season - 5,000 trees\nPhase 5 (Months 24+): Long-term care and impact assessment",
                        "order_number": 3
                    },
                    {
                        "title": "Budget Overview",
                        "content": "Total Request: $250,000\n\nTree seedlings: $75,000\nPlanting equipment: $30,000\nStaff salaries: $80,000\nVolunteer coordination: $25,000\nSite preparation: $20,000\nEducational materials: $10,000\nMonitoring equipment: $10,000",
                        "order_number": 4
                    },
                    {
                        "title": "Community Impact",
                        "content": "This project will directly benefit approximately 50,000 residents living within a 1-mile radius of the planting sites. Long-term ecological benefits include improved air quality, reduced urban heat island effect, increased biodiversity, and enhanced community green spaces.",
                        "order_number": 5
                    }
                ]
                
                for section in sections:
                    section_id = str(uuid.uuid4())
                    cursor.execute('''
                    INSERT INTO sections (id, title, content, order_number, project_id)
                    VALUES (%s, %s, %s, %s, %s)
                    ''', (
                        section_id,
                        section["title"],
                        section["content"],
                        section["order_number"],
                        project["id"]
                    ))
                    logger.info(f"Created section {section['title']} with ID: {section_id}")
                    
                    # Add an AI suggestion for this section
                    suggestion_content = f"Consider enhancing the {section['title'].lower()} with more specific metrics and outcomes. You could also add information about similar successful projects."
                    cursor.execute('''
                    INSERT INTO ai_suggestions (id, content, section_id, status)
                    VALUES (%s, %s, %s, %s)
                    ''', (
                        str(uuid.uuid4()),
                        suggestion_content,
                        section_id,
                        "pending"
                    ))
                
                # Add a sample document
                cursor.execute('''
                INSERT INTO documents (id, title, file_path, document_type, project_id)
                VALUES (%s, %s, %s, %s, %s)
                ''', (
                    str(uuid.uuid4()),
                    "Urban Reforestation Proposal",
                    "generated_documents/sample-proposal.pdf",
                    "proposal",
                    project["id"]
                ))
                
                # Add a compliance check
                cursor.execute('''
                INSERT INTO compliance_checks (id, project_id, check_type, result)
                VALUES (%s, %s, %s, %s)
                ''', (
                    str(uuid.uuid4()),
                    project["id"],
                    "regulatory",
                    '{"compliant": true, "score": 92, "issues": []}'
                ))
        
        conn.commit()
        logger.info("Sample data created successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        if conn is not None:
            conn.rollback()
        return False
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

if __name__ == "__main__":
    max_attempts = 7
    retry_interval = 5
    
    for attempt in range(max_attempts):
        try:
            logger.info(f"Attempt {attempt + 1} of {max_attempts} to initialize database with SQL")
            
            # Create schema
            if create_schema():
                # Schema created successfully, create sample data
                if create_sample_data():
                    logger.info("Database initialization complete!")
                    break
                else:
                    logger.error("Failed to create sample data")
            else:
                logger.error("Failed to create schema")
            
            # If we get here, something failed
            if attempt < max_attempts - 1:
                logger.error(f"Attempt {attempt + 1} failed")
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
                # Increment the retry interval for each attempt (backoff)
                retry_interval = min(retry_interval * 1.5, 30)  # Cap at 30 seconds
            else:
                logger.error(f"Maximum attempts reached. Database initialization failed.")
        
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            if attempt < max_attempts - 1:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
                retry_interval = min(retry_interval * 1.5, 30)
            else:
                logger.error(f"Maximum attempts reached. Database initialization failed.")
                raise 