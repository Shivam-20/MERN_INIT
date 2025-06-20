#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage
function show_usage {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Available commands:"
    echo "  dev           Start development environment (default)"
    echo "  prod         Start production environment"
    echo "  stop         Stop all running containers"
    echo "  down         Stop and remove all containers, networks, and volumes"
    echo "  logs         View container logs"
    echo "  clean        Remove all unused containers, networks, and volumes"
    echo "  help         Show this help message"
    echo ""
    echo "Options:"
    echo "  -b, --build  Rebuild containers before starting"
    echo "  -d, --detach Run containers in the background"
}

# Default values
COMMAND="dev"
BUILD=false
DETACH=""
SERVICE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        dev|prod|stop|down|logs|clean|help)
            COMMAND="$1"
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -d|--detach)
            DETACH="-d"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            # If it's not a known command or option, it might be a service name
            if [[ -z "$SERVICE" ]]; then
                SERVICE="$1"
            else
                echo "Unknown option: $1"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Function to check if Docker is running
function check_docker {
    if ! docker info > /dev/null 2>&1; then
        echo "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to generate SSL certificates if they don't exist
function generate_ssl {
    if [[ ! -f "nginx/ssl/cert.pem" || ! -f "nginx/ssl/key.pem" ]]; then
        echo -e "${YELLOW}Generating self-signed SSL certificates...${NC}"
        mkdir -p nginx/ssl
        ./generate-ssl.sh
        echo -e "${GREEN}SSL certificates generated successfully!${NC}"
    fi
}

# Main command handler
case $COMMAND in
    dev)
        check_docker
        echo -e "${GREEN}Starting development environment...${NC}"
        
        # Change to docker directory
        cd "$(dirname "$0")/../docker" || exit 1
        
        # Build if requested
        if [[ "$BUILD" = true ]]; then
            echo "Building containers..."
            docker-compose -f docker-compose.yml build
        fi
        
        # Start services
        docker-compose -f docker-compose.yml up $DETACH
        ;;
        
    prod)
        check_docker
        echo -e "${GREEN}Starting production environment...${NC}"
        
        # Change to docker directory
        cd "$(dirname "$0")/../docker" || exit 1
        
        # Generate SSL certificates if they don't exist
        generate_ssl
        
        # Build if requested
        if [[ "$BUILD" = true ]]; then
            echo "Building containers..."
            docker-compose -f docker-compose.prod.yml build
        fi
        
        # Start services
        docker-compose -f docker-compose.prod.yml up $DETACH
        ;;
        
    stop)
        echo -e "${YELLOW}Stopping all containers...${NC}"
        cd "$(dirname "$0")/../docker" || exit 1
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop $SERVICE
        ;;
        
    down)
        echo -e "${YELLOW}Stopping and removing all containers, networks, and volumes...${NC}"
        cd "$(dirname "$0")/../docker" || exit 1
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -v
        ;;
        
    logs)
        cd "$(dirname "$0")/../docker" || exit 1
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f $SERVICE
        ;;
        
    clean)
        echo -e "${YELLOW}Removing unused containers, networks, and volumes...${NC}"
        docker system prune -f
        ;;
        
    help)
        show_usage
        ;;
        
    *)
        echo "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
