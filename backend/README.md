# AutoDraft Backend

This is the backend service for AutoDraft, an AI-powered grant application assistant. The backend is built with FastAPI and uses LangChain for AI integration.

## Features

- User authentication and management
- Organization profiles
- Project creation and management
- RAG-based document analysis
- AI-assisted grant drafting
- Compliance checking
- Document generation and formatting

## Prerequisites

- Python 3.8+
- PostgreSQL
- OpenAI API key

## Setup

1. **Clone the repository**

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Set up environment variables**

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autodraft
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

4. **Create the database**

```bash
createdb autodraft
```

5. **Initialize the database**

```bash
python init_db.py
```

This will create the necessary tables and add some sample data.

## Running the Backend

Run the backend with:

```bash
python run.py
```

The API will be available at http://localhost:8000.

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## User Flow

The backend supports the complete user flow as outlined in `user_flow.md`:

1. **Authentication**
   - Login/Register: `/token` and `/register`

2. **Project Management**
   - Create Project: `/projects`
   - List Projects: `/projects`

3. **Grant Application Process**
   - Upload Requirements: `/projects/{project_id}/requirements`
   - Generate Questions: `/projects/{project_id}/questions`
   - Submit Answers: `/projects/{project_id}/answers`
   - Edit Sections: `/projects/{project_id}/sections/{section_id}`
   - Respond to AI Suggestions: `/projects/{project_id}/suggestions/{suggestion_id}`

4. **Compliance and Finalization**
   - Check Compliance: `/projects/{project_id}/compliance`
   - Generate Final Document: `/projects/{project_id}/documents`
   - Mark Project as Submitted: `/projects/{project_id}/submit`

## Sample User

A sample user is created during initialization:

- Username: `demo`
- Password: `password`

## Development

### Structure

- `main.py`: Main application entry point with API routes
- `auth.py`: Authentication functionality
- `database.py`: Database connection setup
- `models.py`: SQLAlchemy models
- `services/`: Service modules
  - `rag.py`: RAG functionality for document analysis
  - `compliance.py`: Compliance checking
  - `document.py`: Document generation and formatting 