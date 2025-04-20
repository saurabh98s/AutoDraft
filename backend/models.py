from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON, Table
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

# Association tables
project_users = Table(
    'project_users',
    Base.metadata,
    Column('project_id', String, ForeignKey('projects.id')),
    Column('user_id', String, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=True)
    role = Column(String, nullable=False, default='user')  # user, admin, editor
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organization = relationship('Organization', back_populates='users')
    projects = relationship('Project', secondary=project_users, back_populates='users')

class Organization(Base):
    __tablename__ = 'organizations'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    mission = Column(Text, nullable=True)
    tax_id = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    users = relationship('User', back_populates='organization')
    projects = relationship('Project', back_populates='organization')

class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    grant_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default='draft')  # draft, in_progress, submitted, approved, rejected
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organization = relationship('Organization', back_populates='projects')
    users = relationship('User', secondary=project_users, back_populates='projects')
    sections = relationship('Section', back_populates='project')
    documents = relationship('Document', back_populates='project')

class Section(Base):
    __tablename__ = 'sections'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    order = Column(Integer, nullable=False)
    project_id = Column(String, ForeignKey('projects.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    project = relationship('Project', back_populates='sections')
    ai_suggestions = relationship('AISuggestion', back_populates='section')

class Document(Base):
    __tablename__ = 'documents'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # proposal, budget, supporting_doc
    project_id = Column(String, ForeignKey('projects.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    project = relationship('Project', back_populates='documents')

class AISuggestion(Base):
    __tablename__ = 'ai_suggestions'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(Text, nullable=False)
    section_id = Column(String, ForeignKey('sections.id'), nullable=False)
    status = Column(String, nullable=False, default='pending')  # pending, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    section = relationship('Section', back_populates='ai_suggestions')

class ComplianceCheck(Base):
    __tablename__ = 'compliance_checks'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('projects.id'), nullable=False)
    check_type = Column(String, nullable=False)  # mission_alignment, regulatory, format
    result = Column(JSON, nullable=False)  # Store check results as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship('Project') 