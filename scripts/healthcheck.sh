#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
CHECK_MONGO=true
CHECK_BACKEND=true
CHECK_FRONTEND=true
CHECK_DISK=true
CHECK_MEMORY=true
CHECK_CPU=true
VERBOSE=false
THRESHOLD_DISK=90  # Disk usage percentage threshold
THRESHOLD_MEMORY=90  # Memory usage percentage threshold
THRESHOLD_CPU=90  # CPU usage percentage threshold

# Function to display usage
function show_usage {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -v, --verbose       Show detailed information"
    echo "  --no-mongo          Skip MongoDB check"
    echo "  --no-backend        Skip backend check"
    echo "  --no-frontend       Skip frontend check"
    echo "  --no-disk           Skip disk usage check"
    echo "  --no-memory         Skip memory usage check"
    echo "  --no-cpu            Skip CPU usage check"
    echo "  --disk-threshold N  Set disk usage threshold percentage (default: 90)"
    echo "  --mem-threshold N   Set memory usage threshold percentage (default: 90)"
    echo "  --cpu-threshold N   Set CPU usage threshold percentage (default: 90)"
    echo ""
    echo "Examples:"
    echo "  $0 -v"
    echo "  $0 --disk-threshold 80 --mem-threshold 85"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --no-mongo)
            CHECK_MONGO=false
            shift
            ;;
        --no-backend)
            CHECK_BACKEND=false
            shift
            ;;
        --no-frontend)
            CHECK_FRONTEND=false
            shift
            ;;
        --no-disk)
            CHECK_DISK=false
            shift
            ;;
        --no-memory)
            CHECK_MEMORY=false
            shift
            ;;
        --no-cpu)
            CHECK_CPU=false
            shift
            ;;
        --disk-threshold)
            THRESHOLD_DISK="$2"
            shift
            shift
            ;;
        --mem-threshold)
            THRESHOLD_MEMORY="$2"
            shift
            shift
            ;;
        --cpu-threshold)
            THRESHOLD_CPU="$2"
            shift
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esbdone

# Function to check if a command exists
function command_exists {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
function check_docker {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}✗ Docker is not running${NC}"
        return 1
    else
        if [ "$VERBOSE" = true ]; then
            echo -e "${GREEN}✓ Docker is running${NC}"
            echo -e "  $(docker --version | cut -d ',' -f 1)"
        fi
        return 0
    fi
}

# Function to check MongoDB status
function check_mongodb {
    if [ "$CHECK_MONGO" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}=== MongoDB Status ===${NC}"
    
    if ! command_exists docker; then
        echo -e "${RED}✗ Docker is not installed${NC}"
        return 1
    fi
    
    if ! check_docker; then
        return 1
    fi
    
    # Check if MongoDB container is running
    if ! docker ps --format '{{.Names}}' | grep -q 'mongodb'; then
        echo -e "${RED}✗ MongoDB container is not running${NC}"
        return 1
    fi
    
    # Check MongoDB connection
    if docker-compose -f docker-compose.prod.yml exec -T mongodb mongo --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ MongoDB is running and responsive${NC}"
        
        if [ "$VERBOSE" = true ]; then
            # Get MongoDB version
            MONGO_VERSION=$(docker-compose -f docker-compose.prod.yml exec -T mongodb mongo --version | cut -d ' ' -f 4-)
            echo -e "  Version: ${MONGO_VERSION}"
            
            # Get database stats
            echo -e "  Database stats:"
            docker-compose -f docker-compose.prod.yml exec -T mongodb mongo encriptofy --eval "
                print('    - Collections: ' + db.getCollectionNames().length);
                stats = db.stats();
                print('    - Data size: ' + (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB');
                print('    - Storage size: ' + (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB');
                print('    - Indexes: ' + stats.indexes);
            " | grep -v "MongoDB" | grep -v "connecting to" | grep -v "Implicit session"
        fi
        
        return 0
    else
        echo -e "${RED}✗ MongoDB is running but not responding${NC}"
        return 1
    fi
}

# Function to check backend status
function check_backend {
    if [ "$CHECK_BACKEND" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}=== Backend Status ===${NC}"
    
    if ! command_exists curl; then
        echo -e "${YELLOW}⚠ curl is not installed, skipping API check${NC}"
        return 1
    fi
    
    # Check if backend container is running
    if ! docker ps --format '{{.Names}}' | grep -q 'backend'; then
        echo -e "${RED}✗ Backend container is not running${NC}"
        return 1
    fi
    
    # Get backend container IP and port
    BACKEND_URL="http://localhost:5000"
    
    # Check if backend is responding
    if curl -s -o /dev/null --head --fail "$BACKEND_URL/health"; then
        echo -e "${GREEN}✓ Backend is running and responsive${NC}"
        
        if [ "$VERBOSE" = true ]; then
            # Get backend version
            VERSION=$(curl -s "$BACKEND_URL/version" 2>/dev/null || echo "unknown")
            echo -e "  Version: ${VERSION}"
            
            # Get environment info
            echo -e "  Environment:"
            curl -s "$BACKEND_URL/health" | jq -r 'to_entries[] | "    - \(.key): \(.value)"' 2>/dev/null || \
                echo "    - Could not retrieve detailed health information"
        fi
        
        return 0
    else
        echo -e "${RED}✗ Backend is running but not responding${NC}"
        return 1
    fi
}

# Function to check frontend status
function check_frontend {
    if [ "$CHECK_FRONTEND" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}=== Frontend Status ===${NC}"
    
    if ! command_exists curl; then
        echo -e "${YELLOW}⚠ curl is not installed, skipping frontend check${NC}"
        return 1
    fi
    
    # Check if frontend container is running (if in production mode)
    if docker ps --format '{{.Names}}' | grep -q 'frontend'; then
        FRONTEND_URL="http://localhost:80"
    elif docker ps --format '{{.Names}}' | grep -q 'client'; then
        FRONTEND_URL="http://localhost:3000"
    else
        echo -e "${YELLOW}⚠ No frontend container found${NC}"
        return 1
    fi
    
    # Check if frontend is responding
    if curl -s -o /dev/null --head --fail "$FRONTEND_URL"; then
        echo -e "${GREEN}✓ Frontend is running and responsive${NC}"
        
        if [ "$VERBOSE" = true ]; then
            # Get page title
            TITLE=$(curl -s "$FRONTEND_URL" | grep -o '<title>.*</title>' | sed 's/<\?title\?>//g' || echo "unknown")
            echo -e "  Title: ${TITLE}"
            
            # Get response headers
            echo -e "  Response headers:"
            curl -s -I "$FRONTEND_URL" | grep -E 'HTTP|Server|Content-Type|X-Powered-By' | \
                sed 's/^/    /' | sed 's/: /: /g'
        fi
        
        return 0
    else
        echo -e "${RED}✗ Frontend is running but not responding${NC}"
        return 1
    fi
}

# Function to check disk usage
function check_disk {
    if [ "$CHECK_DISK" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}=== Disk Usage ===${NC}"
    
    # Get disk usage for the current directory
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | tr -d '%')
    
    if [ "$DISK_USAGE" -ge "$THRESHOLD_DISK" ]; then
        echo -e "${RED}✗ Disk usage is ${DISK_USAGE}% (threshold: ${THRESHOLD_DISK}%)${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Disk usage is ${DISK_USAGE}% (threshold: ${THRESHOLD_DISK}%)${NC}"
        
        if [ "$VERBOSE" = true ]; then
            df -h
        fi
        
        return 0
    fi
}

# Function to check memory usage
function check_memory {
    if [ "$CHECK_MEMORY" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}=== Memory Usage ===${NC}"
    
    if ! command_exists free; then
        echo -e "${YELLOW}⚠ free command not available, skipping memory check${NC}"
        return 1
    fi
    
    # Get memory usage percentage
    MEM_TOTAL=$(free | grep Mem | awk '{print $2}')
    MEM_USED=$(free | grep Mem | awk '{print $3}')
    MEM_USAGE_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
    
    if [ "$MEM_USAGE_PERCENT" -ge "$THRESHOLD_MEMORY" ]; then
        echo -e "${RED}✗ Memory usage is ${MEM_USAGE_PERCENT}% (threshold: ${THRESHOLD_MEMORY}%)${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Memory usage is ${MEM_USAGE_PERCENT}% (threshold: ${THRESHOLD_MEMORY}%)${NC}"
        
        if [ "$VERBOSE" = true ]; then
            free -h
        fi
        
        return 0
    fi
}

# Function to check CPU usage
function check_cpu {
    if [ "$CHECK_CPU" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}=== CPU Usage ===${NC}"
    
    if ! command_exists top; then
        echo -e "${YELLOW}⚠ top command not available, skipping CPU check${NC}"
        return 1
    fi
    
    # Get CPU usage percentage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' | cut -d'.' -f1)
    
    if [ "$CPU_USAGE" -ge "$THRESHOLD_CPU" ]; then
        echo -e "${RED}✗ CPU usage is ${CPU_USAGE}% (threshold: ${THRESHOLD_CPU}%)${NC}"
        return 1
    else
        echo -e "${GREEN}✓ CPU usage is ${CPU_USAGE}% (threshold: ${THRESHOLD_CPU}%)${NC}"
        
        if [ "$VERBOSE" = true ]; then
            top -bn1 | head -15
        fi
        
        return 0
    fi
}

# Function to check Docker containers
function check_containers {
    echo -e "\n${YELLOW}=== Docker Containers ===${NC}"
    
    if ! command_exists docker; then
        echo -e "${RED}✗ Docker is not installed${NC}"
        return 1
    fi
    
    if ! check_docker; then
        return 1
    fi
    
    # List all containers with status
    echo -e "${YELLOW}Running containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
    
    # Check for unhealthy containers
    UNHEALTHY_CONTAINERS=$(docker ps --filter "health=unhealthy" --format "{{.Names}}")
    if [ -n "$UNHEALTHY_CONTAINERS" ]; then
        echo -e "\n${RED}✗ Unhealthy containers:${NC}"
        for container in $UNHEALTHY_CONTAINERS; do
            echo -e "  - ${RED}$container${NC}"
            if [ "$VERBOSE" = true ]; then
                docker inspect --format='{{json .State.Health}}' "$container" | jq
            fi
        done
        return 1
    else
        echo -e "\n${GREEN}✓ All containers are healthy${NC}"
        return 0
    fi
}

# Main function
function main {
    local exit_code=0
    
    echo -e "${YELLOW}=== Encriptofy Health Check ===${NC}"
    echo -e "Started at: $(date)"
    
    # Check system resources
    check_disk || exit_code=1
    check_memory || exit_code=1
    check_cpu || exit_code=1
    
    # Check Docker and containers
    check_containers || exit_code=1
    
    # Check services
    check_mongodb || exit_code=1
    check_backend || exit_code=1
    check_frontend || exit_code=1
    
    # Summary
    echo -e "\n${YELLOW}=== Health Check Summary ===${NC}"
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ All systems are operational${NC}"
    else
        echo -e "${RED}✗ Some issues were detected${NC}"
    fi
    
    echo -e "\nCompleted at: $(date)"
    return $exit_code
}

# Run the main function
main
exit $?
