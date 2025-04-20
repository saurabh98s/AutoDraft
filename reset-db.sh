#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}AutoDraft Database Reset Tool${NC}"
echo -e "--------------------------------"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running or not accessible.${NC}"
  echo "Please make sure Docker is installed and running."
  exit 1
fi

# Check if containers exist
if ! docker ps -a | grep -q autodraft-postgres; then
  echo -e "${RED}AutoDraft containers not found. Please run docker-compose up first.${NC}"
  exit 1
fi

echo -e "${YELLOW}This script will reset the AutoDraft database.${NC}"
echo -e "${RED}WARNING: All data will be lost!${NC}"
read -p "Are you sure you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Operation cancelled.${NC}"
  exit 0
fi

echo -e "${YELLOW}Stopping containers...${NC}"
docker-compose down

echo -e "${YELLOW}Removing database volume...${NC}"
docker volume rm autodraft_postgres_data

echo -e "${YELLOW}Recreating containers...${NC}"
docker-compose up -d postgres backend

echo -e "${YELLOW}Waiting for database initialization...${NC}"
sleep 15 # Increase wait time to ensure database is ready

echo -e "${YELLOW}Checking database status...${NC}"
docker logs autodraft-backend | tail -n 20

echo -e "${YELLOW}Connecting to database to verify tables...${NC}"
docker exec autodraft-postgres psql -U postgres -d autodraft -c "\dt"

echo -e "${GREEN}Database reset complete!${NC}"
echo -e "${YELLOW}Backend API should be available at:${NC} http://localhost:8000"
echo -e "${YELLOW}API Documentation:${NC} http://localhost:8000/docs" 