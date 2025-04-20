#!/bin/bash

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}AutoDraft Docker Debug Script${NC}"
echo -e "--------------------------------"

# Check Docker status
echo -e "${YELLOW}Checking Docker service status...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running or not accessible.${NC}"
  echo "Please make sure Docker is installed and running."
else
  echo -e "${GREEN}Docker is running.${NC}"
fi

# Check running containers
echo -e "\n${YELLOW}Checking running containers...${NC}"
container_count=$(docker ps -q | wc -l)
if [ "$container_count" -eq 0 ]; then
  echo -e "${RED}No containers currently running.${NC}"
else
  echo -e "${GREEN}Found $container_count running containers:${NC}"
  docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
fi

# Check if our containers exist
echo -e "\n${YELLOW}Checking AutoDraft containers...${NC}"
backend_status=$(docker ps -a --filter "name=autodraft-backend" --format "{{.Status}}")
db_status=$(docker ps -a --filter "name=autodraft-postgres" --format "{{.Status}}")

if [ -z "$backend_status" ]; then
  echo -e "${RED}Backend container not found.${NC}"
else
  echo -e "Backend: ${GREEN}$backend_status${NC}"
fi

if [ -z "$db_status" ]; then
  echo -e "${RED}Database container not found.${NC}"
else
  echo -e "Database: ${GREEN}$db_status${NC}"
fi

# Check logs if containers exist
echo -e "\n${YELLOW}Recent logs for containers:${NC}"

if [ -n "$backend_status" ]; then
  echo -e "\n${YELLOW}BACKEND LOGS:${NC}"
  docker logs autodraft-backend --tail 20
fi

if [ -n "$db_status" ]; then
  echo -e "\n${YELLOW}DATABASE LOGS:${NC}"
  docker logs autodraft-postgres --tail 10
fi

# Check network
echo -e "\n${YELLOW}Network information:${NC}"
docker network ls
echo ""
docker network inspect bridge | grep -A 5 autodraft

# Helpful commands
echo -e "\n${YELLOW}Helpful commands:${NC}"
echo -e "View backend logs: ${GREEN}docker logs autodraft-backend${NC}"
echo -e "View database logs: ${GREEN}docker logs autodraft-postgres${NC}"
echo -e "Restart containers: ${GREEN}docker-compose down && docker-compose up -d${NC}"
echo -e "Enter backend container: ${GREEN}docker exec -it autodraft-backend bash${NC}"
echo -e "Enter database container: ${GREEN}docker exec -it autodraft-postgres bash${NC}" 