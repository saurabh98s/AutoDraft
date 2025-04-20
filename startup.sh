#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting AutoDraft application...${NC}"

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

# Check if OPENAI_API_KEY is set properly
if grep -q "your_openai_api_key" .env; then
  echo -e "${RED}Error: OpenAI API key not set.${NC}" >&2
  echo "Please edit .env file and set your OpenAI API key."
  exit 1
fi

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up --build -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
  echo -e "${GREEN}AutoDraft is now running!${NC}"
  echo -e "Backend API: ${GREEN}http://localhost:8000${NC}"
  echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
  echo -e "API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
  echo ""
  echo -e "${YELLOW}To stop the application:${NC} docker-compose down"
  echo -e "${YELLOW}To view logs:${NC} docker-compose logs -f"
else
  echo -e "${RED}Error: Failed to start containers.${NC}" >&2
  echo "Check the logs with: docker-compose logs"
  exit 1
fi 