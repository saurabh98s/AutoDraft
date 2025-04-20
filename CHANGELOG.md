# Changelog

All notable changes to the AutoDraft project will be documented in this file.

## [0.2.0] - 2024-04-20

### Added
- Database models for users, organizations, projects, sections, and documents
- Authentication system with JWT tokens
- RAG service for AI-powered context augmentation
- Compliance checking service
- Document assembly service
- Frontend components:
  - Layout with navigation
  - Login page
  - Dashboard with project list
  - Project editor with AI suggestions
  - Profile page with organization details
- Redux store setup with authentication slice

### Backend
- SQLAlchemy models and database configuration
- JWT authentication with password hashing
- RAG service using LangChain and OpenAI
- Compliance checking with LLM integration
- Document assembly with template support
- API endpoints for all core functionality

### Frontend
- React components with TypeScript
- Redux state management
- Draft.js integration for rich text editing
- Real-time AI suggestions
- Responsive design with Tailwind CSS
- Form handling and validation

### Documentation
- Updated README with detailed setup instructions
- API documentation structure
- Component documentation

## [0.1.0] - 2024-04-20

### Added
- Initial project setup with backend and frontend structure
- FastAPI backend with core routes and authentication
- React frontend with TypeScript and Redux setup
- Basic project documentation in README.md
- Authentication slice for Redux state management
- Core routing setup with protected routes
- Basic project structure following the user flow and task list requirements

### Backend
- FastAPI application with CORS middleware
- Basic authentication endpoints
- Project management routes
- RAG query endpoint structure
- Compliance checking endpoint structure
- Document assembly endpoint structure

### Frontend
- React application with TypeScript
- Redux store configuration
- Authentication state management
- Basic routing setup
- Toast notifications integration
- Layout component structure

### Documentation
- README.md with project overview and setup instructions
- Initial CHANGELOG.md
- Project structure documentation

### Next Steps
- Set up CI/CD pipeline
- Add unit tests
- Implement real-time collaboration features
- Add more AI-powered features
- Enhance document templates
- Add export functionality
- Implement user roles and permissions 