#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display usage
function show_usage {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -e, --env FILE   Specify environment file (default: .env.production)"
    echo "  -f, --force      Force deployment without confirmation"
    echo "  --no-cache       Disable build cache"
    echo "  --skip-tests     Skip running tests before deployment"
    echo ""
    echo "Example:"
    echo "  $0 -e .env.production --no-cache"
}

# Default values
ENV_FILE=".env.production"
FORCE=false
NO_CACHE=""
SKIP_TESTS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_usage
            exit 0
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Function to check if a command exists
function command_exists {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
function check_docker {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

# Function to check if required files exist
function check_required_files {
    local missing_files=()
    
    # Check for required files
    for file in "$@"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    # If any files are missing, show error and exit
    if [ ${#missing_files[@]} -ne 0 ]; then
        echo -e "${RED}Error: The following required files are missing:${NC}"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        echo -e "\nPlease make sure all required files exist and try again."
        exit 1
    fi
}

# Function to run tests
function run_tests {
    if [ "$SKIP_TESTS" = true ]; then
        echo -e "${YELLOW}⚠️  Skipping tests as requested${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}Running tests...${NC}"
    
    # Run backend tests
    echo -e "\n${YELLOW}Running backend tests...${NC}"
    cd server
    if ! npm test; then
        echo -e "${RED}❌ Backend tests failed. Aborting deployment.${NC}"
        exit 1
    fi
    cd ..
    
    # Run frontend tests
    echo -e "\n${YELLOW}Running frontend tests...${NC}"
    cd client
    if ! CI=true npm test -- --watchAll=false; then
        echo -e "${RED}❌ Frontend tests failed. Aborting deployment.${NC}"
        exit 1
    fi
    cd ..
    
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
}

# Function to build the application
function build_app {
    echo -e "\n${YELLOW}Building the application...${NC}"
    
    # Build frontend
    echo -e "\n${YELLOW}Building frontend...${NC}"
    cd client
    npm run build
    cd ..
    
    # Build Docker images
    echo -e "\n${YELLOW}Building Docker images...${NC}"
    docker-compose -f docker-compose.prod.yml build $NO_CACHE
}

# Function to deploy the application
function deploy_app {
    echo -e "\n${YELLOW}Starting deployment...${NC}"
    
    # Stop and remove existing containers
    echo -e "\n${YELLOW}Stopping and removing existing containers...${NC}"
    docker-compose -f docker-compose.prod.yml down
    
    # Start services
    echo -e "\n${YELLOW}Starting services...${NC}"
    docker-compose -f docker-compose.prod.yml up -d
    
    # Run database migrations
    echo -e "\n${YELLOW}Running database migrations...${NC}"
    # Uncomment and modify the following line if you have database migrations
    # docker-compose -f docker-compose.prod.yml exec backend npx sequelize-cli db:migrate
    
    # Verify services are running
    echo -e "\n${YELLOW}Verifying services...${NC}"
    docker-compose -f docker-compose.prod.yml ps
    
    echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
}

# Main deployment process
function main {
    # Check if running as root
    if [ "$(id -u)" -eq 0 ]; then
        echo -e "${RED}Error: This script should not be run as root.${NC}"
        exit 1
    fi
    
    # Check if required commands are installed
    if ! command_exists docker || ! command_exists docker-compose; then
        echo -e "${RED}Error: Docker and Docker Compose are required but not installed.${NC}"
        exit 1
    fi
    
    # Check if required files exist
    check_required_files "$ENV_FILE" "docker-compose.prod.yml" "Dockerfile" "Dockerfile.nginx"
    
    # Check if Docker is running
    check_docker
    
    # Show deployment info
    echo -e "\n${YELLOW}=== Encriptofy Production Deployment ===${NC}"
    echo -e "Environment file: ${GREEN}$ENV_FILE${NC}"
    echo -e "Build cache: ${GREEN}${NO_CACHE:-enabled}${NC}"
    echo -e "Skip tests: ${GREEN}${SKIP_TESTS}${NC}"
    
    # Ask for confirmation if not forced
    if [ "$FORCE" = false ]; then
        echo -e "\n${YELLOW}This will deploy the application to production.${NC}"
        read -p "Are you sure you want to continue? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Deployment cancelled.${NC}"
            exit 0
        fi
    fi
    
    # Run tests
    run_tests
    
    # Build the application
    build_app
    
    # Deploy the application
    deploy_app
    
    # Show completion message
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo -e "1. Verify the application is running:"
    echo -e "   ${GREEN}docker-compose -f docker-compose.prod.yml ps${NC}"
    echo -e "2. View the application logs:"
    echo -e "   ${GREEN}docker-compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "3. To stop the application:"
    echo -e "   ${GREEN}docker-compose -f docker-compose.prod.yml down${NC}"
}

# Run the main function
main
