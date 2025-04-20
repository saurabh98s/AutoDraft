#!/bin/bash

echo "Starting AutoDraft Backend Services..."

# Stop any running containers
echo "Stopping any existing containers..."
docker-compose down

# Build and start the backend services
echo "Building and starting backend services..."
docker-compose up -d postgres backend

echo "Backend services started!"
echo "Database is available at localhost:5432"
echo "API is available at http://localhost:8000"
echo ""
echo "To run the frontend separately:"
echo "cd frontend"
echo "npm install --legacy-peer-deps"
echo "npm run dev"
echo ""
echo "To stop the backend services:"
echo "docker-compose down" 