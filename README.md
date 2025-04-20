# AutoDraft - AI-Powered Grant Application Assistant

AutoDraft is an application that helps organizations streamline their grant application process using AI assistance.

## Features

- User authentication and management
- Organization profiles
- Project creation and management
- RAG-based document analysis
- AI-assisted grant drafting
- Compliance checking
- Document generation and formatting

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- OpenAI API key

### Quick Start

1. Clone the repository
2. Run the startup script:

```bash
./startup.sh
```

The script will:
- Check for required dependencies
- Create a `.env` file if it doesn't exist (you'll need to add your OpenAI API key)
- Build and start the containers

### Manual Setup

If you prefer to set up manually:

1. Create a `.env` file in the root directory:
```
OPENAI_API_KEY=your_openai_api_key
```

2. Build and start the containers:
```bash
docker-compose up --build -d
```

### Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Sample User

A sample user is created during initialization:
- Username: `demo`
- Password: `password`

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── services/         # Service modules
│   │   ├── rag.py        # RAG functionality
│   │   ├── compliance.py # Compliance checking
│   │   └── document.py   # Document generation
│   ├── main.py           # Main application
│   ├── models.py         # Database models
│   └── ...
├── frontend/             # Next.js frontend
├── docker-compose.yml    # Docker Compose configuration
└── startup.sh            # Startup script
```

## Development

### Stopping the Application

```bash
docker-compose down
```

### Viewing Logs

```bash
docker-compose logs -f
```

### Rebuilding Containers

```bash
docker-compose up --build -d
```

## Tech Stack

### Backend
- FastAPI
- LangChain/Semantic-Kernel
- PostgreSQL
- Redis
- Neo4j
- Chroma/PGVector

### Frontend
- React + TypeScript
- Redux Toolkit
- Draft.js
- Victory.js
- WebSocket

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker
- PostgreSQL
- Redis
- Neo4j

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/autodraft.git
cd autodraft
```

2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

3. Frontend Setup
```bash
cd frontend
npm install
```

4. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start Development Servers
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

## Documentation

Detailed documentation can be found in the `docs/` directory:
- API Documentation
- Architecture Overview
- Development Guide
- Deployment Guide

## License

MIT License - see LICENSE file for details 