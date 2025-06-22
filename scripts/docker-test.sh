#!/bin/bash

# Fast Docker Testing Script for Encriptofy
# Optimized for speed and efficiency

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} 🚀 Fast Docker Testing - Encriptofy${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to clean up containers
cleanup() {
    print_status "Cleaning up existing containers..."
    docker rm -f encriptofy-backend encriptofy-frontend 2>/dev/null || true
    docker network rm docker_encriptofy-network 2>/dev/null || true
}

# Function to build optimized images
build_images() {
    print_status "Building optimized Docker images..."
    
    cd "$(dirname "$0")/../docker"
    
    # Build with cache
    DOCKER_BUILDKIT=1 docker-compose build --parallel
    
    print_status "✅ Images built successfully"
}

# Function to ultra-fast restart (no rebuild)
ultra_fast_restart() {
    print_status "Ultra-fast restart (preserving cache)..."
    
    cd "$(dirname "$0")/../docker"
    
    # Just restart containers, don't rebuild
    docker-compose restart
    
    print_status "✅ Containers restarted in seconds"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    cd "$(dirname "$0")/../docker"
    
    # Start in detached mode
    docker-compose up -d
    
    print_status "Services started, waiting for health checks..."
}

# Function to wait for services
wait_for_services() {
    print_status "Waiting for backend to be ready..."
    
    # Wait for backend health check
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
            print_status "✅ Backend is ready!"
            break
        fi
        sleep 2
        timeout=$((timeout-2))
        echo -n "."
    done
    
    if [ $timeout -le 0 ]; then
        print_error "❌ Backend failed to start within 60 seconds"
        docker-compose logs backend
        exit 1
    fi
    
    # Check frontend
    print_status "Checking frontend..."
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_status "✅ Frontend is ready!"
    else
        print_warning "⚠️ Frontend might still be starting up"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Test backend API
    print_status "Testing backend API..."
    response=$(curl -s http://localhost:5000/api/health)
    if echo "$response" | grep -q "success"; then
        print_status "✅ Backend API test passed"
    else
        print_error "❌ Backend API test failed"
        echo "Response: $response"
        exit 1
    fi
    
    # Test server-side tests in container
    print_status "Running server tests in container..."
    if docker exec encriptofy-backend sh -c "cd /app/server && npm test"; then
        print_status "✅ Server tests passed"
    else
        print_error "❌ Server tests failed"
        exit 1
    fi
}

# Function to show logs
show_logs() {
    print_status "Showing service logs..."
    cd "$(dirname "$0")/../docker"
    docker-compose logs --tail=50
}

# Function to show status
show_status() {
    print_header
    print_status "Service Status:"
    echo ""
    
    # Check backend
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        echo -e "Backend:  ${GREEN}✅ Running${NC} (http://localhost:5000)"
    else
        echo -e "Backend:  ${RED}❌ Not Running${NC}"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "Frontend: ${GREEN}✅ Running${NC} (http://localhost:3000)"
    else
        echo -e "Frontend: ${RED}❌ Not Running${NC}"
    fi
    
    echo ""
    print_status "Docker containers:"
    docker ps --filter "name=encriptofy" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Main execution
main() {
    case "${1:-help}" in
        "quick"|"q")
            print_header
            check_docker
            cleanup
            start_services
            wait_for_services
            run_tests
            show_status
            ;;
        "ultra"|"u")
            print_header
            check_docker
            ultra_fast_restart
            wait_for_services
            run_tests
            show_status
            ;;
        "build"|"b")
            print_header
            check_docker
            cleanup
            build_images
            start_services
            wait_for_services
            run_tests
            show_status
            ;;
        "start"|"s")
            print_header
            check_docker
            start_services
            wait_for_services
            show_status
            ;;
        "test"|"t")
            print_header
            run_tests
            ;;
        "logs"|"l")
            show_logs
            ;;
        "status"|"st")
            show_status
            ;;
        "stop")
            print_status "Stopping services..."
            cd "$(dirname "$0")/../docker"
            docker-compose down
            ;;
        "clean"|"c")
            print_status "Cleaning up everything..."
            cd "$(dirname "$0")/../docker"
            docker-compose down -v
            docker system prune -f
            ;;
        "help"|"h"|*)
            echo "Fast Docker Testing Script"
            echo ""
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  ultra, u     - ⚡ ULTRA FAST restart (2-3 seconds!)"
            echo "  quick, q     - Quick test (start + test)"
            echo "  build, b     - Build images and test"
            echo "  start, s     - Start services only"
            echo "  test, t      - Run tests only"
            echo "  logs, l      - Show logs"
            echo "  status, st   - Show status"
            echo "  stop         - Stop services"
            echo "  clean, c     - Clean everything"
            echo "  help, h      - Show this help"
            ;;
    esac
}

# Run main function
main "$@" 