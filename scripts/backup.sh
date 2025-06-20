#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default values
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="encriptofy_backup_${TIMESTAMP}"
COMPRESS=true
KEEP_LAST=5
CONFIG_FILE="backup.config"

# Load configuration if exists
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# Function to display usage
function show_usage {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -d, --dir DIR       Set backup directory (default: $BACKUP_DIR)"
    echo "  -n, --name NAME     Set backup name prefix (default: encriptofy_backup)"
    echo "  --no-compress      Disable compression"
    echo "  --keep-last N      Keep last N backups (default: 5)"
    echo "  --list             List available backups"
    echo "  --restore FILE     Restore from backup file"
    echo "  --setup-cron       Setup automatic daily backups"
    echo ""
    echo "Examples:"
    echo "  $0 -d /mnt/backups --keep-last 7"
    echo "  $0 --list"
    echo "  $0 --restore backups/encriptofy_backup_20230101_120000.tar.gz"
}

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

# Function to create backup
function create_backup {
    echo -e "${YELLOW}Creating backup: $BACKUP_NAME${NC}"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create a temporary directory for the backup
    TEMP_DIR=$(mktemp -d)
    
    # Export MongoDB data
    echo -e "${YELLOW}Exporting MongoDB data...${NC}"
    docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --archive --gzip > "${TEMP_DIR}/mongodb_dump.gz"
    
    # Copy important files
    echo -e "${YELLOW}Copying important files...${NC}"
    cp -r "server/config" "${TEMP_DIR}/"
    cp -r "nginx/ssl" "${TEMP_DIR}/" 2>/dev/null || true
    cp "docker-compose.prod.yml" "${TEMP_DIR}/"
    cp ".env.production" "${TEMP_DIR}/" 2>/dev/null || cp ".env" "${TEMP_DIR}/.env.production"
    
    # Create a backup archive
    echo -e "${YELLOW}Creating backup archive...${NC}"
    if [ "$COMPRESS" = true ]; then
        BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
        tar -czf "$BACKUP_FILE" -C "$TEMP_DIR" .
        echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
    else
        BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}"
        mkdir -p "$BACKUP_DIR"
        cp -r "$TEMP_DIR/"* "$BACKUP_DIR/"
        echo -e "${GREEN}✓ Backup created in directory: $BACKUP_DIR${NC}"
    fi
    
    # Clean up temporary directory
    rm -rf "$TEMP_DIR"
    
    # Clean up old backups if KEEP_LAST is set
    if [ "$KEEP_LAST" -gt 0 ]; then
        echo -e "${YELLOW}Cleaning up old backups...${NC}"
        if [ "$COMPRESS" = true ]; then
            # For compressed backups
            (cd "$BACKUP_DIR" && ls -t *.tar.gz 2>/dev/null | tail -n +$((KEEP_LAST + 1)) | xargs -I {} rm -- {})
        else
            # For directory backups
            (cd "$BACKUP_DIR" && ls -d */ 2>/dev/null | sort -r | tail -n +$((KEEP_LAST + 1)) | xargs -I {} rm -rf -- {})
        fi
    fi
    
    echo -e "${GREEN}✓ Backup completed successfully!${NC}
    echo -e "Backup location: $(pwd)/$BACKUP_FILE"
}

# Function to list available backups
function list_backups {
    echo -e "${YELLOW}Available backups:${NC}"
    
    if [ "$COMPRESS" = true ]; then
        # List compressed backups
        if [ -d "$BACKUP_DIR" ]; then
            (cd "$BACKUP_DIR" && ls -lht *.tar.gz 2>/dev/null || echo "No compressed backups found.")
        else
            echo "Backup directory '$BACKUP_DIR' does not exist."
        fi
    else
        # List directory backups
        if [ -d "$BACKUP_DIR" ]; then
            (cd "$BACKUP_DIR" && ls -lhtd */ 2>/dev/null || echo "No directory backups found.")
        else
            echo "Backup directory '$BACKUP_DIR' does not exist."
        fi
    fi
}

# Function to restore from backup
function restore_backup {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ] && [ ! -d "$backup_file" ]; then
        echo -e "${RED}Error: Backup file or directory not found: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Restoring from backup: $backup_file${NC}"
    
    # Ask for confirmation
    read -p "This will overwrite existing data. Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Restore cancelled.${NC}"
        exit 0
    fi
    
    # Create a temporary directory for extraction
    TEMP_RESTORE_DIR=$(mktemp -d)
    
    # Extract backup if it's a compressed file
    if [[ "$backup_file" == *.tar.gz ]]; then
        echo -e "${YELLOW}Extracting backup...${NC}"
        if ! tar -xzf "$backup_file" -C "$TEMP_RESTORE_DIR"; then
            echo -e "${RED}Error: Failed to extract backup file${NC}"
            rm -rf "$TEMP_RESTORE_DIR"
            exit 1
        fi
    else
        # It's a directory, copy its contents
        cp -r "$backup_file/"* "$TEMP_RESTORE_DIR/"
    fi
    
    # Stop services
    echo -e "${YELLOW}Stopping services...${NC}"
    docker-compose -f docker-compose.prod.yml down
    
    # Restore MongoDB data
    echo -e "${YELLOW}Restoring MongoDB data...${NC}"
    if [ -f "$TEMP_RESTORE_DIR/mongodb_dump.gz" ]; then
        docker-compose -f docker-compose.prod.yml up -d mongodb
        sleep 10  # Wait for MongoDB to start
        
        # Drop existing database
        docker-compose -f docker-compose.prod.yml exec -T mongodb mongo --eval "db.getSiblingDB('encriptofy').dropDatabase()"
        
        # Restore from backup
        cat "$TEMP_RESTORE_DIR/mongodb_dump.gz" | \
            docker-compose -f docker-compose.prod.yml exec -T mongodb mongorestore --archive --gzip
    else
        echo -e "${YELLOW}No MongoDB dump found in backup. Skipping database restore.${NC}"
    fi
    
    # Restore configuration files
    echo -e "${YELLOW}Restoring configuration files...${NC}"
    if [ -d "$TEMP_RESTORE_DIR/config" ]; then
        mkdir -p "server/config"
        cp -r "$TEMP_RESTORE_DIR/config/"* "server/config/"
    fi
    
    if [ -d "$TEMP_RESTORE_DIR/ssl" ]; then
        mkdir -p "nginx/ssl"
        cp -r "$TEMP_RESTORE_DIR/ssl/"* "nginx/ssl/"
    fi
    
    # Clean up
    rm -rf "$TEMP_RESTORE_DIR"
    
    # Restart services
    echo -e "${YELLOW}Restarting services...${NC}"
    docker-compose -f docker-compose.prod.yml up -d
    
    echo -e "${GREEN}✓ Restore completed successfully!${NC}"
}

# Function to setup cron job for automatic backups
function setup_cron {
    local script_path="$(pwd)/$0"
    local cron_job="0 2 * * * cd $(pwd) && $script_path -d $(pwd)/backups --keep-last 7"
    
    echo -e "${YELLOW}Setting up daily automatic backup at 2 AM...${NC}"
    
    # Check if the cron job already exists
    if crontab -l 2>/dev/null | grep -q "$script_path"; then
        echo -e "${YELLOW}Cron job already exists. Updating...${NC}"
        (crontab -l | grep -v "$script_path") | crontab -
    fi
    
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
    
    echo -e "${GREEN}✓ Daily backup has been scheduled at 2 AM.${NC}"
    echo -e "To view scheduled backups, run: ${GREEN}crontab -l${NC}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_usage
            exit 0
            ;;
        -d|--dir)
            BACKUP_DIR="$2"
            shift
            shift
            ;;
        -n|--name)
            BACKUP_NAME="${2}_${TIMESTAMP}"
            shift
            shift
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        --keep-last)
            KEEP_LAST="$2"
            shift
            shift
            ;;
        --list)
            list_backups
            exit 0
            ;;
        --restore)
            restore_backup "$2"
            exit 0
            ;;
        --setup-cron)
            setup_cron
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main backup process
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
    
    # Check if Docker is running
    check_docker
    
    # Create backup
    create_backup
}

# Run the main function
main
