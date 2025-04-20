from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Body, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os
import json
import asyncio
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from sse_starlette.sse import EventSourceResponse

# Import database and auth modules - use absolute imports
from database import get_db
from auth import get_current_user, get_current_active_user, create_access_token, SECRET_KEY, ALGORITHM
from models import User, Project, Organization, Section, Document, AISuggestion, ComplianceCheck

# Import services
from services.rag import process_document, generate_questions, query_rag
from services.compliance import check_compliance, perform_gap_analysis
from services.document import format_document, assemble_final_document
from services.research import research_grant_opportunities, get_grant_details
from services.research_agent import research_topic, generate_section, generate_all_sections
from services.text_transform import transform_text
from services.agent import run_agent

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AutoDraft API",
    description="AI-Powered Grant Application Assistant API",
    version="1.0.0"
)

# Get allowed origins from environment or use default
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
print(f"CORS allowed origins: {allowed_origins}")

# CORS middleware configuration - fixed to ensure proper format
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for JWT tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

# Helper function to get current user without requiring authentication
async def get_optional_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    if not token:
        return None
        
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
            
        # Find the user in the database
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            return None
            
        return user
    except JWTError:
        return None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Dashboard endpoints
@app.get("/dashboard")
async def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Get summary data for the dashboard including:
    - Active projects count
    - Recent projects
    - Upcoming deadlines
    - Grant opportunity recommendations
    """
    # Get active projects count
    active_projects_count = db.query(Project).filter(Project.status != "submitted").count()
    
    # Get recent projects
    recent_projects = db.query(Project).order_by(Project.created_at.desc()).limit(5).all()
    recent_projects_data = []
    for project in recent_projects:
        recent_projects_data.append({
            "id": project.id,
            "title": project.title,
            "status": project.status,
            "created_at": project.created_at
        })
    
    # Get latest research findings
    recent_grants = await research_grant_opportunities(limit=3)
    
    # Construct dashboard response
    return {
        "active_projects_count": active_projects_count,
        "recent_projects": recent_projects_data,
        "recent_grant_opportunities": recent_grants,
        "system_status": "operational"
    }

# Grant research endpoints
@app.get("/research/grants")
async def search_grants(
    keywords: Optional[str] = None,
    category: Optional[str] = None,
    max_amount: Optional[int] = None,
    deadline_after: Optional[str] = None,
    limit: int = 10
):
    """Search for grant opportunities based on criteria"""
    grants = await research_grant_opportunities(
        keywords=keywords,
        category=category,
        max_amount=max_amount,
        deadline_after=deadline_after,
        limit=limit
    )
    return {"grants": grants}

@app.get("/research/grants/{grant_id}")
async def get_grant_opportunity(grant_id: str):
    """Get detailed information about a specific grant opportunity"""
    grant_details = await get_grant_details(grant_id)
    if not grant_details:
        raise HTTPException(status_code=404, detail="Grant opportunity not found")
    return grant_details

# Project routes with simplified access (no auth)
@app.post("/projects")
async def create_project(
    title: str,
    description: Optional[str] = None,
    grant_type: str = "standard",
    funding_source: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Get the first organization or create one if none exists
    org = db.query(Organization).first()
    if not org:
        org = Organization(name="Default Organization")
        db.add(org)
        db.commit()
        db.refresh(org)
    
    new_project = Project(
        title=title,
        description=description,
        grant_type=grant_type,
        organization_id=org.id,
        status="draft",
        project_metadata=json.dumps({"funding_source": funding_source}) if funding_source else None
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    return {
        "message": "Project created successfully", 
        "id": new_project.id,
        "title": new_project.title
    }

@app.get("/projects")
async def list_projects(
    status: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    # Build query with optional filters
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    
    projects = query.order_by(Project.created_at.desc()).all()
    
    result = []
    for project in projects:
        result.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "grant_type": project.grant_type,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "metadata": json.loads(project.project_metadata) if project.project_metadata else {}
        })
    
    return result

@app.get("/projects/{project_id}")
async def get_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get sections for this project
    sections = db.query(Section).filter(Section.project_id == project_id).order_by(Section.order).all()
    section_data = []
    for section in sections:
        # Get suggestions for this section
        suggestions = db.query(AISuggestion).filter(AISuggestion.section_id == section.id).all()
        suggestion_data = []
        for suggestion in suggestions:
            suggestion_data.append({
                "id": suggestion.id,
                "content": suggestion.content,
                "status": suggestion.status,
                "created_at": suggestion.created_at
            })
            
        section_data.append({
            "id": section.id,
            "title": section.title,
            "content": section.content,
            "order": section.order,
            "suggestions": suggestion_data
        })
    
    # Get compliance checks for this project
    compliance_checks = db.query(ComplianceCheck).filter(
        ComplianceCheck.project_id == project_id
    ).order_by(ComplianceCheck.created_at.desc()).all()
    
    compliance_data = []
    for check in compliance_checks:
        compliance_data.append({
            "id": check.id,
            "check_type": check.check_type,
            "result": json.loads(check.result) if check.result else {},
            "created_at": check.created_at
        })
    
    # Get documents for this project
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    document_data = []
    for doc in documents:
        document_data.append({
            "id": doc.id,
            "title": doc.title,
            "document_type": doc.document_type,
            "file_path": doc.file_path,
            "created_at": doc.created_at
        })
    
    # Construct project response with sections
    project_metadata = json.loads(project.project_metadata) if project.project_metadata else {}
    
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "grant_type": project.grant_type,
        "status": project.status,
        "organization_id": project.organization_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "metadata": project_metadata,
        "sections": section_data,
        "compliance_checks": compliance_data,
        "documents": document_data
    }

# Requirements upload and processing
@app.post("/projects/{project_id}/requirements")
async def upload_requirements(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Process the uploaded document
    try:
        # Save file to disk temporarily
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process document with RAG service
        sections = await process_document(file_path, project_id)
        
        # Save requirement document to database
        req_document = Document(
            title=f"Requirements - {file.filename}",
            file_path=file_path,
            document_type="requirements",
            project_id=project_id
        )
        db.add(req_document)
        
        # Save sections to database
        for i, section_data in enumerate(sections):
            section = Section(
                title=section_data["title"],
                content=section_data["content"],
                order=i,
                project_id=project_id
            )
            db.add(section)
        
        db.commit()
        
        return {"message": "Requirements document processed successfully", "sections_count": len(sections)}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )

# AI analysis and question generation
@app.get("/projects/{project_id}/questions")
async def get_ai_questions(
    project_id: str,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get the requirements document
    req_doc = db.query(Document).filter(
        Document.project_id == project_id,
        Document.document_type == "requirements"
    ).first()
    
    if not req_doc:
        raise HTTPException(status_code=404, detail="Requirements document not found")
    
    # Generate questions based on the document
    questions = await generate_questions(req_doc.file_path, project_id)
    
    return {"questions": questions}

# Answer submission and draft generation
@app.post("/projects/{project_id}/answers")
async def submit_answers(
    project_id: str,
    answers: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Store the answers and generate draft sections
    for question_id, answer in answers.items():
        # Create or update section for each answer
        section = db.query(Section).filter(
            Section.project_id == project_id,
            Section.title == f"Question {question_id}"
        ).first()
        
        if not section:
            section = Section(
                title=f"Question {question_id}",
                content=answer,
                order=int(question_id),
                project_id=project_id
            )
            db.add(section)
        else:
            section.content = answer
        
        db.commit()
        
        # Generate AI suggestion for this section
        # This would be done asynchronously in a real implementation
        suggestion_text = await query_rag(answer, project_id)
        
        suggestion = AISuggestion(
            content=suggestion_text,
            section_id=section.id,
            status="pending"
        )
        
        db.add(suggestion)
        db.commit()
    
    # Update project status
    project.status = "in_progress"
    db.commit()
    
    return {"message": "Answers submitted and draft sections generated"}

# Generate alternative suggestion
@app.post("/projects/{project_id}/sections/{section_id}/suggest")
async def generate_alternative_suggestion(
    project_id: str,
    section_id: str,
    instruction: str = Body(None),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section or section.project_id != project_id:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Generate AI suggestion with optional instruction
    prompt = f"Original content: {section.content}"
    if instruction:
        prompt += f"\nInstruction: {instruction}"
    
    suggestion_text = await query_rag(prompt, project_id)
    
    suggestion = AISuggestion(
        content=suggestion_text,
        section_id=section.id,
        status="pending"
    )
    
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)
    
    return {
        "id": suggestion.id, 
        "content": suggestion.content,
        "status": suggestion.status,
        "created_at": suggestion.created_at
    }

# Review and edit routes
@app.put("/projects/{project_id}/sections/{section_id}")
async def update_section(
    project_id: str,
    section_id: str,
    content: str = Body(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    section = db.query(Section).filter(Section.id == section_id).first()
    if not section or section.project_id != project_id:
        raise HTTPException(status_code=404, detail="Section not found")
    
    section.content = content
    db.commit()
    
    return {"message": "Section updated successfully"}

@app.put("/projects/{project_id}/suggestions/{suggestion_id}")
async def respond_to_suggestion(
    project_id: str,
    suggestion_id: str,
    status: str = Body(...),  # "accepted" or "rejected"
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    suggestion = db.query(AISuggestion).filter(AISuggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check if suggestion belongs to this project
    section = db.query(Section).filter(Section.id == suggestion.section_id).first()
    if not section or section.project_id != project_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this suggestion")
    
    suggestion.status = status
    
    # If suggestion is accepted, update the section content
    if status == "accepted":
        section.content = suggestion.content
    
    db.commit()
    
    return {"message": f"Suggestion {status}"}

# Compliance check routes
@app.post("/projects/{project_id}/compliance")
async def run_compliance_check(
    project_id: str,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all sections
    sections = db.query(Section).filter(Section.project_id == project_id).all()
    
    # Combine section content
    full_text = " ".join([section.content for section in sections])
    
    # Run compliance check
    compliance_result = await check_compliance(full_text, project_id)
    
    # Store compliance results
    check = ComplianceCheck(
        project_id=project_id,
        check_type="regulatory",
        result=json.dumps(compliance_result)
    )
    
    db.add(check)
    db.commit()
    
    # Run gap analysis
    gap_result = await perform_gap_analysis(full_text, project_id)
    
    # Store gap analysis results
    gap_check = ComplianceCheck(
        project_id=project_id,
        check_type="gap_analysis",
        result=json.dumps(gap_result)
    )
    
    db.add(gap_check)
    db.commit()
    
    return {
        "compliance": compliance_result,
        "gap_analysis": gap_result
    }

# Document assembly routes
@app.post("/projects/{project_id}/documents")
async def generate_final_document(
    project_id: str,
    document_type: str = "proposal",
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all sections ordered by their order field
    sections = db.query(Section).filter(
        Section.project_id == project_id
    ).order_by(Section.order).all()
    
    # Structure for document assembly
    document_content = []
    for section in sections:
        document_content.append({
            "title": section.title,
            "content": section.content
        })
    
    # Assemble the final document
    file_path = await assemble_final_document(document_content, project_id, document_type)
    
    # Create a document record
    new_document = Document(
        title=f"{project.title} - {document_type.capitalize()}",
        file_path=file_path,
        document_type=document_type,
        project_id=project_id
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    return {
        "message": "Document generated successfully",
        "document_id": new_document.id,
        "file_path": file_path
    }

@app.get("/projects/{project_id}/documents")
async def list_project_documents(
    project_id: str,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    
    result = []
    for doc in documents:
        result.append({
            "id": doc.id,
            "title": doc.title,
            "document_type": doc.document_type,
            "created_at": doc.created_at,
            "file_path": doc.file_path
        })
    
    return {"documents": result}

# Submission tracking
@app.post("/projects/{project_id}/submit")
async def mark_project_submitted(
    project_id: str,
    submission_notes: Optional[str] = None,
    submission_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project status
    project.status = "submitted"
    
    # Store submission metadata
    metadata = json.loads(project.project_metadata) if project.project_metadata else {}
    metadata.update({
        "submission_notes": submission_notes,
        "submission_date": submission_date or datetime.utcnow().isoformat()
    })
    project.project_metadata = json.dumps(metadata)
    
    db.commit()
    
    return {"message": "Project marked as submitted", "submission_date": metadata["submission_date"]}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

# Add UI-friendly dashboard endpoint
@app.get("/api/dashboard/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get summary data for the dashboard in the format expected by the UI
    """
    # Get projects by status
    draft_count = db.query(Project).filter(Project.status == "draft").count()
    submitted_count = db.query(Project).filter(Project.status == "submitted").count()
    approved_count = db.query(Project).filter(Project.status == "approved").count()
    rejected_count = db.query(Project).filter(Project.status == "rejected").count()
    
    # Get upcoming deadlines
    upcoming_deadlines = 0
    projects = db.query(Project).all()
    for project in projects:
        metadata = json.loads(project.project_metadata) if project.project_metadata else {}
        if "deadline" in metadata:
            try:
                deadline = datetime.fromisoformat(metadata["deadline"].replace('Z', '+00:00'))
                if deadline > datetime.utcnow():
                    upcoming_deadlines += 1
            except (ValueError, TypeError):
                pass
    
    # Get grants data for listing
    grants = []
    for project in db.query(Project).order_by(Project.created_at.desc()).all():
        metadata = json.loads(project.project_metadata) if project.project_metadata else {}
        grants.append({
            "id": project.id,
            "title": project.title,
            "funder": metadata.get("funding_source", "Unknown"),
            "deadline": metadata.get("deadline", ""),
            "status": project.status,
            "updatedAt": project.updated_at.isoformat() if project.updated_at else ""
        })
    
    return {
        "stats": {
            "activeGrants": draft_count + submitted_count,
            "upcomingDeadlines": upcoming_deadlines,
            "submittedApplications": submitted_count,
            "approved": approved_count,
            "rejected": rejected_count,
            "totalGrants": len(grants)
        },
        "grants": grants
    }

# Create a new grant with sections
@app.post("/api/grants/new")
async def create_new_grant(
    title: str = Body(...),
    funder: str = Body(...),
    deadline: str = Body(...),
    description: Optional[str] = Body(None),
    amount: Optional[str] = Body(None),
    category: Optional[str] = Body("education"),
    db: Session = Depends(get_db)
):
    """Create a new grant with default sections"""
    
    # Get the first organization or create one if none exists
    org = db.query(Organization).first()
    if not org:
        org = Organization(name="Default Organization")
        db.add(org)
        db.commit()
        db.refresh(org)
    
    # Set up metadata
    metadata = {
        "funding_source": funder,
        "deadline": deadline,
        "amount": amount,
        "category": category
    }
    
    # Create the project
    new_project = Project(
        title=title,
        description=description,
        grant_type="standard",
        organization_id=org.id,
        status="draft",
        project_metadata=json.dumps(metadata)
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Create default sections
    default_sections = [
        {"title": "Abstract", "order": 1, "content": ""},
        {"title": "Introduction", "order": 2, "content": ""},
        {"title": "Methodology", "order": 3, "content": ""},
        {"title": "Budget", "order": 4, "content": ""},
        {"title": "Timeline", "order": 5, "content": ""}
    ]
    
    for section_data in default_sections:
        section = Section(
            title=section_data["title"],
            content=section_data["content"],
            order=section_data["order"],
            project_id=new_project.id
        )
        db.add(section)
    
    db.commit()
    
    return {
        "id": new_project.id,
        "title": new_project.title,
        "status": "draft",
        "message": "Grant project created successfully with default sections"
    }

# Get grant with sections in the format expected by UI
@app.get("/api/grants/{grant_id}")
async def get_grant_with_sections(
    grant_id: str,
    db: Session = Depends(get_db)
):
    """Get grant details with sections in format expected by UI"""
    project = db.query(Project).filter(Project.id == grant_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Get metadata
    metadata = json.loads(project.project_metadata) if project.project_metadata else {}
    
    # Get sections
    sections_query = db.query(Section).filter(Section.project_id == grant_id).order_by(Section.order)
    sections_list = []
    
    for section in sections_query.all():
        sections_list.append({
            "id": section.id,
            "title": section.title,
            "content": section.content
        })
    
    # Convert to record expected by UI components
    sections_record = {}
    for section in sections_list:
        sections_record[section["id"]] = section
    
    # Generate layout data for the editor
    layout = []
    for i, section in enumerate(sections_list):
        layout.append({
            "i": section["id"],
            "x": 0,
            "y": i * 6,
            "w": 12,
            "h": 6,
            "minW": 6,
            "maxW": 12
        })
    
    return {
        "id": project.id,
        "title": project.title,
        "funder": metadata.get("funding_source", ""),
        "deadline": metadata.get("deadline", ""),
        "status": project.status,
        "description": project.description,
        "amount": metadata.get("amount", ""),
        "category": metadata.get("category", ""),
        "updatedAt": project.updated_at.isoformat(),
        "sections": sections_record,
        "layout": layout
    }

# Update section content
@app.put("/api/grants/{grant_id}/sections/{section_id}")
async def update_section_content(
    grant_id: str,
    section_id: str,
    content: str = Body(...),
    db: Session = Depends(get_db)
):
    """Update content of a specific section"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == grant_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Find and update the section
    section = db.query(Section).filter(
        Section.id == section_id,
        Section.project_id == grant_id
    ).first()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found in this grant")
    
    section.content = content
    section.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "id": section.id,
        "title": section.title,
        "content": section.content,
        "message": "Section updated successfully"
    }

# Run compliance check on grant
@app.post("/api/grants/{grant_id}/compliance-check")
async def run_compliance_check_ui(
    grant_id: str,
    db: Session = Depends(get_db)
):
    """Run compliance check on grant and return UI-friendly results"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == grant_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Get all sections
    sections = db.query(Section).filter(Section.project_id == grant_id).all()
    if not sections:
        raise HTTPException(status_code=400, detail="Grant has no sections to check")
    
    # Mock compliance issues (in a real app, this would use a service)
    mock_issues = [
        {
            "id": "1",
            "section": "Abstract",
            "severity": "high",
            "message": "Missing project timeline",
            "suggestion": "Add a brief timeline of key project milestones",
            "fixed": False
        },
        {
            "id": "2",
            "section": "Budget",
            "severity": "high",
            "message": "Budget exceeds maximum allowable amount",
            "suggestion": "Reduce budget to below $100,000",
            "fixed": False
        },
        {
            "id": "3",
            "section": "Methodology",
            "severity": "medium",
            "message": "Missing organizational capacity statement",
            "suggestion": "Add information about your organization's ability to execute the project",
            "fixed": False
        },
        {
            "id": "4",
            "section": "Introduction",
            "severity": "low",
            "message": "Section is too verbose",
            "suggestion": "Reduce length by 15-20%",
            "fixed": False
        }
    ]
    
    # Create a compliance check record
    compliance_check = ComplianceCheck(
        project_id=grant_id,
        check_type="regulatory",
        result=json.dumps({
            "issues": mock_issues,
            "score": 78,
            "timestamp": datetime.utcnow().isoformat()
        })
    )
    
    db.add(compliance_check)
    db.commit()
    
    return {
        "score": 78,
        "issues": mock_issues,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Compliance check completed"
    }

# Research agent endpoints
@app.post("/api/research/topic")
async def run_research(
    topic: str = Body(...),
    context: str = Body(""),
):
    """Run a research on a topic and return findings."""
    results = await research_topic(topic, context)
    return results

@app.post("/api/grants/{grant_id}/generate-section/{section_type}")
async def generate_section_content(
    grant_id: str,
    section_type: str,
    db: Session = Depends(get_db)
):
    """Generate content for a specific section of a grant proposal."""
    # Get the project data
    project = db.query(Project).filter(Project.id == grant_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Get existing section if it exists
    section = db.query(Section).filter(
        Section.project_id == grant_id,
        Section.title == section_type
    ).first()
    
    # Generate content for the section
    content = await generate_section(
        section_type=section_type,
        project_id=grant_id,
        title=project.title,
        description=project.description or ""
    )
    
    # If the section exists, update it
    if section:
        section.content = content["content"]
        db.commit()
    else:
        # Otherwise create a new section
        # Determine the order based on existing sections
        max_order = db.query(db.func.max(Section.order)).filter(
            Section.project_id == grant_id
        ).scalar() or 0
        
        new_section = Section(
            title=section_type,
            content=content["content"],
            order=max_order + 1,
            project_id=grant_id
        )
        db.add(new_section)
        db.commit()
        db.refresh(new_section)
        section = new_section
    
    return {
        "id": section.id,
        "title": section.title,
        "content": content["content"],
        "sources": content["sources"],
        "suggestions": content["suggestions"]
    }

@app.post("/api/grants/{grant_id}/generate-all-sections")
async def generate_all_sections_content(
    grant_id: str,
    db: Session = Depends(get_db)
):
    """Generate content for all standard sections of a grant proposal."""
    # Get the project data
    project = db.query(Project).filter(Project.id == grant_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Generate content for all sections
    all_content = await generate_all_sections(
        project_id=grant_id,
        title=project.title,
        description=project.description or ""
    )
    
    # Update or create sections in the database
    section_data = {}
    for section_type, content in all_content.items():
        # Convert to title case for database
        section_title = section_type.capitalize()
        
        # Check if section already exists
        section = db.query(Section).filter(
            Section.project_id == grant_id,
            Section.title == section_title
        ).first()
        
        if section:
            # Update existing section
            section.content = content["content"]
            db.commit()
            db.refresh(section)
        else:
            # Create new section
            max_order = db.query(db.func.max(Section.order)).filter(
                Section.project_id == grant_id
            ).scalar() or 0
            
            section = Section(
                title=section_title,
                content=content["content"],
                order=max_order + 1,
                project_id=grant_id
            )
            db.add(section)
            db.commit()
            db.refresh(section)
        
        # Add to response data
        section_data[section_type] = {
            "id": section.id,
            "title": section.title,
            "content": content["content"],
            "sources": content["sources"],
            "suggestions": content["suggestions"]
        }
    
    return section_data

@app.post("/api/grants/{grant_id}/research-assistant")
async def run_research_assistant(
    grant_id: str,
    query: str = Body(...),
    db: Session = Depends(get_db)
):
    """Run research on a specific query related to the grant."""
    # Get the project data
    project = db.query(Project).filter(Project.id == grant_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Use the project context to enhance the research
    context = f"Grant proposal titled '{project.title}'. {project.description or ''}"
    
    # Run the research
    results = await research_topic(query, context)
    
    return {
        "query": query,
        "results": results,
        "grant_id": grant_id
    }

# Text transformation endpoint
@app.post("/api/text/transform")
async def transform_text_endpoint(
    text: str = Body(...),
    transformation_type: str = Body(...),
    custom_instruction: str = Body(""),
):
    """Transform text according to the specified transformation type and instructions."""
    result = await transform_text(text, transformation_type, custom_instruction)
    return result

# GrantBot agent endpoint with streaming response
@app.get("/api/agent/run")
async def agent_run(request: Request, message: str):
    """
    Run the agent with server-sent events for streaming responses.
    Uses the dedicated agent service for AI-powered responses.
    """
    async def event_generator():
        try:
            # Get context from the request - useful for editor integration
            section_id = request.query_params.get("section_id", None)
            section_text = request.query_params.get("section_text", "")
            
            # Initial response
            yield {
                "event": "message",
                "id": "1",
                "retry": 15000,
                "data": json.dumps({
                    "role": "assistant",
                    "content": "I'm analyzing your request..."
                })
            }
            
            # Use the agent service to generate a streaming response
            async for response in run_agent(message, section_id, section_text):
                if "content" in response and response["content"]:
                    yield {
                        "event": "message",
                        "id": str(id(response)),
                        "data": json.dumps({
                            "role": response.get("role", "assistant"),
                            "content": response["content"]
                        })
                    }
                
                if "tool_call" in response and response["tool_call"]:
                    yield {
                        "event": "message",
                        "id": str(id(response)),
                        "data": json.dumps({
                            "tool_call": response["tool_call"]
                        })
                    }
                
                # Client disconnected
                if await request.is_disconnected():
                    print("Client disconnected")
                    return
                    
        except Exception as e:
            print(f"Error in event generator: {str(e)}")
            yield {
                "event": "error",
                "id": "error",
                "data": json.dumps({
                    "role": "system",
                    "content": f"An error occurred: {str(e)}"
                })
            }
    
    headers = {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
    
    return EventSourceResponse(event_generator(), headers=headers)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 