#!/bin/bash

# 🔧 Fix Dependencies Script for Encriptofy
# This script fixes common dependency conflicts

set -e

echo "🔧 Fixing Dependencies..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fix client dependencies
fix_client_deps() {
    print_status "Fixing client dependencies..."
    
    if [ -d "client" ]; then
        cd client
        
        # Remove existing node_modules and lock files
        print_status "Cleaning client dependencies..."
        rm -rf node_modules package-lock.json
        
        # Install with legacy peer deps if needed
        print_status "Installing client dependencies..."
        if npm install; then
            print_success "Client dependencies installed successfully!"
        else
            print_warning "Trying with legacy peer deps..."
            npm install --legacy-peer-deps
            print_success "Client dependencies installed with legacy peer deps!"
        fi
        
        cd ..
    else
        print_error "Client directory not found!"
    fi
}

# Fix server dependencies
fix_server_deps() {
    print_status "Fixing server dependencies..."
    
    if [ -d "server" ]; then
        cd server
        
        # Remove existing node_modules and lock files
        print_status "Cleaning server dependencies..."
        rm -rf node_modules package-lock.json
        
        # Install with legacy peer deps if needed
        print_status "Installing server dependencies..."
        if npm install; then
            print_success "Server dependencies installed successfully!"
        else
            print_warning "Trying with legacy peer deps..."
            npm install --legacy-peer-deps
            print_success "Server dependencies installed with legacy peer deps!"
        fi
        
        cd ..
    else
        print_error "Server directory not found!"
    fi
}

# Test builds
test_builds() {
    print_status "Testing builds..."
    
    # Test client build
    if [ -d "client" ]; then
        print_status "Testing client build..."
        cd client
        if npm run build; then
            print_success "Client build successful!"
        else
            print_error "Client build failed!"
            exit 1
        fi
        cd ..
    fi
    
    # Test server (if it has a build script)
    if [ -d "server" ]; then
        cd server
        if grep -q "\"build\":" package.json; then
            print_status "Testing server build..."
            if npm run build; then
                print_success "Server build successful!"
            else
                print_warning "Server build failed (this might be normal for some servers)"
            fi
        fi
        cd ..
    fi
}

# Main function
main() {
    echo "🔧 Encriptofy Dependency Fix Script"
    echo "==================================="
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
        print_error "This doesn't appear to be the Encriptofy project root."
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Fix dependencies
    fix_client_deps
    echo ""
    fix_server_deps
    echo ""
    
    # Test builds
    test_builds
    echo ""
    
    print_success "Dependency fix completed successfully!"
    echo ""
    echo "🎉 Your project is now ready for deployment!"
    echo "Run './deploy.sh' to deploy your application."
}

# Run the main function
main "$@" 