from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AutoDraft API",
    description="AI-Powered Grant Application Assistant API",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
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
async def login(username: str, password: str):
    # TODO: Implement actual authentication
    if username != "test" or password != "test":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

# Project routes
@app.post("/projects")
async def create_project(token: str = Depends(oauth2_scheme)):
    # TODO: Implement project creation
    return {"message": "Project created successfully"}

@app.get("/projects")
async def list_projects(token: str = Depends(oauth2_scheme)):
    # TODO: Implement project listing
    return {"projects": []}

# RAG routes
@app.post("/rag/query")
async def query_rag(query: str, token: str = Depends(oauth2_scheme)):
    # TODO: Implement RAG query
    return {"results": []}

# Compliance routes
@app.post("/compliance/check")
async def check_compliance(text: str, token: str = Depends(oauth2_scheme)):
    # TODO: Implement compliance checking
    return {"compliant": True, "issues": []}

# Document routes
@app.post("/documents/assemble")
async def assemble_document(data: dict, token: str = Depends(oauth2_scheme)):
    # TODO: Implement document assembly
    return {"document_url": "https://example.com/document.pdf"}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    # TODO: Implement actual JWT encoding
    return "dummy_token"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 