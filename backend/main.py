from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional, List
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Import database and auth modules - use absolute imports
from database import get_db
from auth import get_current_user, get_current_active_user, create_access_token
from models import User, Project, Organization, Section, Document, AISuggestion, ComplianceCheck

# Import services
from services.rag import process_document, generate_questions, query_rag
from services.compliance import check_compliance, perform_gap_analysis
from services.document import format_document, assemble_final_document

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

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for JWT tokens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Auth routes
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register")
async def register_user(username: str, email: str, password: str, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    new_user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User registered successfully"}

# Organization routes
@app.post("/organizations")
async def create_organization(
    name: str,
    mission: Optional[str] = None,
    tax_id: Optional[str] = None,
    address: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    new_org = Organization(
        name=name,
        mission=mission,
        tax_id=tax_id,
        address=address
    )
    
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    # Update the user's organization
    current_user.organization_id = new_org.id
    db.commit()
    
    return {"message": "Organization created successfully", "id": new_org.id}

@app.put("/organizations/{org_id}")
async def update_organization(
    org_id: str,
    name: Optional[str] = None,
    mission: Optional[str] = None,
    tax_id: Optional[str] = None,
    address: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if current_user.organization_id != org_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this organization")
    
    if name:
        org.name = name
    if mission:
        org.mission = mission
    if tax_id:
        org.tax_id = tax_id
    if address:
        org.address = address
    
    db.commit()
    
    return {"message": "Organization updated successfully"}

# Project routes
@app.post("/projects")
async def create_project(
    title: str,
    description: Optional[str] = None,
    grant_type: str = "standard",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with an organization to create projects"
        )
    
    new_project = Project(
        title=title,
        description=description,
        grant_type=grant_type,
        organization_id=current_user.organization_id,
        status="draft"
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Add current user to project
    new_project.users.append(current_user)
    db.commit()
    
    return {
        "message": "Project created successfully", 
        "id": new_project.id,
        "title": new_project.title
    }

@app.get("/projects")
async def list_projects(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    projects = current_user.projects
    
    result = []
    for project in projects:
        result.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "grant_type": project.grant_type,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at
        })
    
    return {"projects": result}

@app.get("/projects/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    sections = []
    for section in project.sections:
        sections.append({
            "id": section.id,
            "title": section.title,
            "content": section.content,
            "order": section.order
        })
    
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "grant_type": project.grant_type,
        "status": project.status,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "sections": sections
    }

# Requirements upload and processing
@app.post("/projects/{project_id}/requirements")
async def upload_requirements(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Save the uploaded file
    file_location = f"uploads/{project_id}/{file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    
    with open(file_location, "wb+") as file_object:
        file_object.write(await file.read())
    
    # Create a new document record
    new_document = Document(
        title=file.filename,
        file_path=file_location,
        document_type="requirements",
        project_id=project_id
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Process the document using RAG
    analysis_result = await process_document(file_location, project_id)
    
    return {
        "message": "Requirements uploaded and processed successfully",
        "document_id": new_document.id,
        "analysis": analysis_result
    }

# AI analysis and question generation
@app.get("/projects/{project_id}/questions")
async def get_ai_questions(
    project_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
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
    answers: dict = Body(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
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

# Review and edit routes
@app.put("/projects/{project_id}/sections/{section_id}")
async def update_section(
    project_id: str,
    section_id: str,
    content: str = Body(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
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
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
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
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
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
        result=compliance_result
    )
    
    db.add(check)
    db.commit()
    
    # Run gap analysis
    gap_result = await perform_gap_analysis(full_text, project_id)
    
    return {
        "compliance": compliance_result,
        "gap_analysis": gap_result
    }

# Document assembly routes
@app.post("/projects/{project_id}/documents")
async def generate_final_document(
    project_id: str,
    document_type: str = "proposal",
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
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
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    documents = db.query(Document).filter(Document.project_id == project_id).all()
    
    result = []
    for doc in documents:
        result.append({
            "id": doc.id,
            "title": doc.title,
            "document_type": doc.document_type,
            "created_at": doc.created_at
        })
    
    return {"documents": result}

# Submission tracking
@app.post("/projects/{project_id}/submit")
async def mark_project_submitted(
    project_id: str,
    submission_notes: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to this project
    if current_user not in project.users:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Update project status
    project.status = "submitted"
    
    # TODO: Store submission notes and tracking information
    
    db.commit()
    
    return {"message": "Project marked as submitted"}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 