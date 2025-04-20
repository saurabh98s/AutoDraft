#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting AutoDraft...${NC}"

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker is not installed.${NC}" >&2
  echo "Please install Docker and try again."
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo -e "${RED}Error: Docker Compose is not installed.${NC}" >&2
  echo "Please install Docker Compose and try again."
  exit 1
fi

# Check if .env file exists, create if not
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  echo "OPENAI_API_KEY=your_openai_api_key" > .env
  echo -e "${GREEN}.env file created. Please edit it to add your OpenAI API key.${NC}"
  echo -e "${RED}Please add your OpenAI API key to .env and run this script again.${NC}"
  exit 1
fi

# Ensure required directories exist
echo -e "${YELLOW}Ensuring required directories exist...${NC}"
mkdir -p backend/generated_documents
mkdir -p backend/uploads
mkdir -p backend/templates

# Create sample document directory if it doesn't exist
mkdir -p backend/generated_documents/sample-project

# If there's no sample PDF, create a simple text file as fallback
if [ ! -f "backend/generated_documents/sample-proposal.pdf" ]; then
  echo -e "${YELLOW}Creating sample document...${NC}"
  echo "Sample Urban Reforestation Initiative Proposal" > backend/generated_documents/sample-proposal.txt
fi

# Check if OPENAI_API_KEY is set properly
if grep -q "your_openai_api_key" .env; then
  echo -e "${YELLOW}Warning: OpenAI API key not set, demo data will be used.${NC}" >&2
  # Set a dummy key for demo purposes
  sed -i 's/your_openai_api_key/demo_key_for_frontend_only/' .env
fi

# Stop existing containers if running
echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker-compose down

# Clean up any old images to force a rebuild
echo -e "${YELLOW}Cleaning up old containers...${NC}"
docker-compose rm -f backend

# Build and start the containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose build --no-cache backend
docker-compose up -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
  echo -e "${GREEN}AutoDraft is now running!${NC}"
  echo -e "Backend API: ${GREEN}http://localhost:8000${NC}"
  echo -e "API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
  echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
  echo ""
  echo -e "${YELLOW}To stop the application:${NC} docker-compose down"
  echo -e "${YELLOW}To view logs:${NC} docker-compose logs -f"
  
  # Wait a bit and check if containers are still running
  echo -e "${YELLOW}Checking if services are healthy...${NC}"
  sleep 15
  
  if ! docker ps | grep -q autodraft-backend; then
    echo -e "${RED}Error: Backend container has stopped unexpectedly.${NC}" >&2
    echo -e "Showing recent logs:"
    docker logs autodraft-backend --tail 50
    echo ""
    echo -e "${YELLOW}Fix the errors and try again. For full logs, run:${NC} docker logs autodraft-backend"
    exit 1
  elif ! docker ps | grep -q autodraft-frontend; then
    echo -e "${RED}Error: Frontend container has stopped unexpectedly.${NC}" >&2
    echo -e "Showing recent logs:"
    docker logs autodraft-frontend --tail 50
    echo ""
    echo -e "${YELLOW}Fix the errors and try again. For full logs, run:${NC} docker logs autodraft-frontend"
    exit 1
  else
    echo -e "${GREEN}All services are running properly!${NC}"
    
    # Verify database tables
    echo -e "${YELLOW}Verifying database tables...${NC}"
    docker exec autodraft-postgres psql -U postgres -d autodraft -c "\dt" || echo -e "${RED}Could not verify database tables. The backend may still be initializing.${NC}"
    
    echo -e "${GREEN}Your application is ready at: ${NC}http://localhost:3000"
  fi
else
  echo -e "${RED}Error: Failed to start containers.${NC}" >&2
  echo "Check the logs with: docker-compose logs"
  exit 1
fi 