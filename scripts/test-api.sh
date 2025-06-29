#!/bin/bash

# API Unit Testing Script
# This script provides comprehensive testing for all API endpoints and utilities

set -e

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

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "server/package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
}

# Function to install dependencies if needed
install_dependencies() {
    if [ ! -d "server/node_modules" ]; then
        print_status "Installing server dependencies..."
        cd server && npm install && cd ..
        print_success "Dependencies installed"
    fi
}

# Function to run tests with different configurations
run_tests() {
    local mode=$1
    local coverage=$2
    
    cd server
    
    case $mode in
        "unit")
            print_status "Running unit tests..."
            if [ "$coverage" = "true" ]; then
                npm run test:coverage
            else
                npm test
            fi
            ;;
        "watch")
            print_status "Running tests in watch mode..."
            npm run test:watch
            ;;
        "routes")
            print_status "Running route tests only..."
            npx jest __tests__/routes/ --detectOpenHandles --forceExit
            ;;
        "controllers")
            print_status "Running controller tests only..."
            npx jest __tests__/controllers/ --detectOpenHandles --forceExit
            ;;
        "models")
            print_status "Running model tests only..."
            npx jest __tests__/models/ --detectOpenHandles --forceExit
            ;;
        "utils")
            print_status "Running utility tests only..."
            npx jest __tests__/utils/ --detectOpenHandles --forceExit
            ;;
        "auth")
            print_status "Running authentication tests only..."
            npx jest __tests__/routes/auth.test.js --detectOpenHandles --forceExit
            ;;
        "crypto")
            print_status "Running crypto API tests only..."
            npx jest __tests__/routes/cryptoRoutes.test.js --detectOpenHandles --forceExit
            ;;
        "users")
            print_status "Running user API tests only..."
            npx jest __tests__/routes/userRoutes.test.js --detectOpenHandles --forceExit
            ;;
        "coverage")
            print_status "Running tests with coverage report..."
            npm run test:coverage
            ;;
        *)
            print_error "Unknown test mode: $mode"
            print_usage
            exit 1
            ;;
    esac
    
    cd ..
}

# Function to show test coverage summary
show_coverage_summary() {
    if [ -f "server/coverage/lcov-report/index.html" ]; then
        print_success "Coverage report generated at: server/coverage/lcov-report/index.html"
        print_status "Open the HTML file in your browser to view detailed coverage"
    fi
}

# Function to clean test artifacts
clean_tests() {
    print_status "Cleaning test artifacts..."
    cd server
    rm -rf coverage
    rm -rf .nyc_output
    cd ..
    print_success "Test artifacts cleaned"
}

# Function to validate test environment
validate_environment() {
    print_status "Validating test environment..."
    
    # Check if Jest is installed
    if ! cd server && npx jest --version > /dev/null 2>&1; then
        print_error "Jest is not installed. Please run 'npm install' in the server directory"
        exit 1
    fi
    
    # Check if test database is configured
    if [ -z "$MONGODB_URI_TEST" ] && [ -z "$MONGODB_URI" ]; then
        print_warning "No test database URI found. Tests may fail if database connection is required."
        print_status "Set MONGODB_URI_TEST environment variable for dedicated test database"
    fi
    
    cd ..
    print_success "Environment validated"
}

# Function to show test statistics
show_test_stats() {
    if [ -f "server/coverage/coverage-summary.json" ]; then
        print_status "Test Coverage Summary:"
        cd server
        node -e "
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
            console.log('Total Coverage:', coverage.total.lines.pct + '%');
            console.log('Statements:', coverage.total.statements.pct + '%');
            console.log('Branches:', coverage.total.branches.pct + '%');
            console.log('Functions:', coverage.total.functions.pct + '%');
            console.log('Lines:', coverage.total.lines.pct + '%');
        "
        cd ..
    fi
}

# Function to print usage
print_usage() {
    echo "Usage: $0 [OPTIONS] [MODE]"
    echo ""
    echo "Modes:"
    echo "  unit          Run all unit tests (default)"
    echo "  watch         Run tests in watch mode"
    echo "  routes        Run route tests only"
    echo "  controllers   Run controller tests only"
    echo "  models        Run model tests only"
    echo "  utils         Run utility tests only"
    echo "  auth          Run authentication tests only"
    echo "  crypto        Run crypto API tests only"
    echo "  users         Run user API tests only"
    echo "  coverage      Run tests with coverage report"
    echo ""
    echo "Options:"
    echo "  -c, --coverage    Enable coverage reporting"
    echo "  -v, --verbose     Verbose output"
    echo "  -h, --help        Show this help message"
    echo "  --clean           Clean test artifacts"
    echo "  --validate        Validate test environment"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all tests"
    echo "  $0 unit --coverage    # Run all tests with coverage"
    echo "  $0 watch              # Run tests in watch mode"
    echo "  $0 crypto             # Run only crypto API tests"
    echo "  $0 --clean            # Clean test artifacts"
}

# Main script logic
main() {
    local mode="unit"
    local coverage="false"
    local verbose="false"
    local clean="false"
    local validate="false"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--coverage)
                coverage="true"
                shift
                ;;
            -v|--verbose)
                verbose="true"
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            --clean)
                clean="true"
                shift
                ;;
            --validate)
                validate="true"
                shift
                ;;
            unit|watch|routes|controllers|models|utils|auth|crypto|users|coverage)
                mode="$1"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
    
    # Check if we're in the right directory
    check_directory
    
    # Install dependencies if needed
    install_dependencies
    
    # Validate environment if requested
    if [ "$validate" = "true" ]; then
        validate_environment
        exit 0
    fi
    
    # Clean test artifacts if requested
    if [ "$clean" = "true" ]; then
        clean_tests
        exit 0
    fi
    
    # Set verbose mode
    if [ "$verbose" = "true" ]; then
        export NODE_ENV=test
        export DEBUG=*
    fi
    
    # Run tests
    print_status "Starting API tests in $mode mode..."
    if [ "$coverage" = "true" ] && [ "$mode" != "coverage" ]; then
        mode="coverage"
    fi
    
    run_tests "$mode" "$coverage"
    
    # Show results
    if [ "$mode" = "coverage" ] || [ "$coverage" = "true" ]; then
        show_coverage_summary
        show_test_stats
    fi
    
    print_success "API tests completed successfully!"
}

# Run main function with all arguments
main "$@" 