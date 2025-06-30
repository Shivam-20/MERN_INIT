#!/bin/bash

# 🚀 Encriptofy Deployment Script
# This script helps you deploy your application to Vercel and Railway

set -e  # Exit on any error

echo "🚀 Starting Encriptofy Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All requirements are met!"
}

# Check if we're in the right directory
check_directory() {
    print_status "Checking project structure..."
    
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
        print_error "This doesn't appear to be the Encriptofy project root. Please run this script from the project root directory."
        exit 1
    fi
    
    print_success "Project structure looks good!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        npm install
    fi
    
    # Install client dependencies
    if [ -d "client" ]; then
        print_status "Installing client dependencies..."
        cd client
        npm install
        cd ..
    fi
    
    # Install server dependencies
    if [ -d "server" ]; then
        print_status "Installing server dependencies..."
        cd server
        npm install
        cd ..
    fi
    
    print_success "All dependencies installed!"
}

# Build the project
build_project() {
    print_status "Building the project..."
    
    # Build client
    if [ -d "client" ]; then
        print_status "Building client..."
        cd client
        npm run build
        cd ..
    fi
    
    print_success "Project built successfully!"
}

# Check Git status
check_git_status() {
    print_status "Checking Git status..."
    
    if [ ! -d ".git" ]; then
        print_error "This is not a Git repository. Please initialize Git first:"
        echo "  git init"
        echo "  git add ."
        echo "  git commit -m 'Initial commit'"
        exit 1
    fi
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes. Please commit them first:"
        echo "  git add ."
        echo "  git commit -m 'Prepare for deployment'"
        echo ""
        read -p "Do you want to commit changes now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Prepare for deployment"
            print_success "Changes committed!"
        else
            print_error "Please commit your changes before deploying."
            exit 1
        fi
    fi
    
    print_success "Git status is clean!"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying backend to Railway..."
    
    if [ ! -d "server" ]; then
        print_error "Server directory not found!"
        exit 1
    fi
    
    cd server
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Deploy to Railway
    print_status "Starting Railway deployment..."
    railway up
    
    cd ..
    
    print_success "Backend deployed to Railway!"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    if [ ! -d "client" ]; then
        print_error "Client directory not found!"
        exit 1
    fi
    
    cd client
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    print_status "Starting Vercel deployment..."
    vercel --prod
    
    cd ..
    
    print_success "Frontend deployed to Vercel!"
}

# Main deployment function
main() {
    echo "🎯 Encriptofy Deployment Script"
    echo "================================"
    echo ""
    
    # Check requirements
    check_requirements
    
    # Check directory
    check_directory
    
    # Check Git status
    check_git_status
    
    # Install dependencies
    install_dependencies
    
    # Build project
    build_project
    
    echo ""
    echo "🚀 Ready to deploy!"
    echo ""
    echo "Choose deployment option:"
    echo "1) Deploy Backend to Railway"
    echo "2) Deploy Frontend to Vercel"
    echo "3) Deploy Both"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_railway
            ;;
        2)
            deploy_vercel
            ;;
        3)
            deploy_railway
            echo ""
            deploy_vercel
            ;;
        4)
            print_status "Deployment cancelled."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up environment variables in Railway and Vercel"
    echo "2. Configure your MongoDB Atlas database"
    echo "3. Test your deployed application"
    echo ""
    echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
}

# Run the main function
main "$@" 