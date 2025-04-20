from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON, Table
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid
from database import Base

# Many-to-many association table for projects and users
project_users = Table(
    'project_users',
    Base.metadata,
    Column('project_id', String, ForeignKey('projects.id', ondelete="CASCADE"), primary_key=True),
    Column('user_id', String, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    organization_id = Column(String, ForeignKey('organizations.id'))
    role = Column(String, default='user')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organization = relationship('Organization', back_populates='users')
    projects = relationship('Project', secondary=project_users, back_populates='users')

class Organization(Base):
    __tablename__ = 'organizations'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    mission = Column(Text)
    tax_id = Column(String)
    address = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    users = relationship('User', back_populates='organization')
    projects = relationship('Project', back_populates='organization')

class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    grant_type = Column(String, default='standard')
    organization_id = Column(String, ForeignKey('organizations.id'), nullable=False)
    status = Column(String, default='draft')
    project_metadata = Column(Text, nullable=True)  # JSON string for additional project attributes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    organization = relationship('Organization', back_populates='projects')
    users = relationship('User', secondary=project_users, back_populates='projects')
    sections = relationship('Section', back_populates='project', cascade="all, delete-orphan")
    documents = relationship('Document', back_populates='project', cascade="all, delete-orphan")
    compliance_checks = relationship('ComplianceCheck', back_populates='project', cascade="all, delete-orphan")

class Section(Base):
    __tablename__ = 'sections'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text)
    order = Column(Integer)
    project_id = Column(String, ForeignKey('projects.id', ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    project = relationship('Project', back_populates='sections')
    suggestions = relationship('AISuggestion', back_populates='section', cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = 'documents'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    document_type = Column(String, nullable=False)  # proposal, budget, supporting_doc
    project_id = Column(String, ForeignKey('projects.id', ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    project = relationship('Project', back_populates='documents')

class AISuggestion(Base):
    __tablename__ = 'ai_suggestions'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(Text)
    section_id = Column(String, ForeignKey('sections.id', ondelete="CASCADE"))
    status = Column(String, default='pending')  # pending, accepted, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    section = relationship('Section', back_populates='suggestions')

class ComplianceCheck(Base):
    __tablename__ = 'compliance_checks'
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey('projects.id', ondelete="CASCADE"))
    check_type = Column(String, nullable=False)  # regulatory, mission_alignment
    result = Column(Text)  # JSON string with check results
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship('Project', back_populates='compliance_checks') 