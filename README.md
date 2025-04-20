# AutoDraft - AI-Powered Grant Application Assistant

AutoDraft is an intelligent grant application platform that helps organizations streamline their grant writing process using AI assistance.

## Features

- AI-powered grant application drafting
- Real-time collaboration
- Compliance checking
- Document assembly and formatting
- CRM integration
- Mission alignment scoring
- RAG-powered context augmentation

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

## Project Structure

```
autodraft/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── docker/            # Docker configuration
└── docs/             # Documentation
```

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