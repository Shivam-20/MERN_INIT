#!/bin/bash

# Encriptofy Development Helper Script
# Quick access to common development tasks

print_usage() {
    echo "🚀 Encriptofy Development Helper"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  setup         - Initial project setup"
    echo "  start         - Start development servers"
    echo "  test          - Run tests"
    echo "  build         - Build for production"
    echo "  docker        - Start with Docker"
    echo "  docs          - Update documentation"
    echo "  seed          - Database seeding commands"
    echo "  backup        - Create backup"
    echo "  deploy        - Deploy to production"
    echo "  health        - Run health check"
    echo "  clean         - Clean node_modules and reinstall"
    echo "  help          - Show this help"
    echo ""
}

case "$1" in
    "setup"|"install")
        echo "🔧 Setting up Encriptofy development environment..."
        chmod +x scripts/*.sh
        ./scripts/setup-dev.sh
        ;;
    "start"|"dev")
        echo "🚀 Starting development servers..."
        npm run dev
        ;;
    "test")
        echo "🧪 Running tests..."
        npm test
        if [ "$2" = "server" ] || [ "$2" = "backend" ]; then
            cd server && npm test
        elif [ "$2" = "client" ] || [ "$2" = "frontend" ]; then
            cd client && npm test
        fi
        ;;
    "build")
        echo "🏗️ Building for production..."
        npm run build
        ;;
    "docker")
        echo "🐳 Starting with Docker..."
        if [ "$2" = "test" ] || [ "$2" = "quick" ]; then
            ./scripts/docker-test.sh "${3:-quick}"
        else
            ./scripts/docker-compose.sh "$2"
        fi
        ;;
    "docs")
        echo "📚 Updating documentation..."
        ./scripts/update-docs.sh "$2"
        ;;
    "seed")
        echo "🌱 Running database seeder..."
        if [ "$2" = "admin" ]; then
            cd server && npm run seed:admin
        else
            echo "Available seeders:"
            echo "  ./dev.sh seed admin          - Seed admin user"
            echo "  ./dev.sh seed admin validate - Validate admin config"
            echo "  ./dev.sh seed admin stats    - Show admin stats"
        fi
        ;;
    "backup")
        echo "💾 Creating backup..."
        ./scripts/backup.sh "$2"
        ;;
    "deploy")
        echo "🚀 Deploying to production..."
        ./scripts/deploy-prod.sh
        ;;
    "health")
        echo "🏥 Running health check..."
        ./scripts/healthcheck.sh
        ;;
    "clean")
        echo "🧹 Cleaning and reinstalling dependencies..."
        rm -rf node_modules client/node_modules server/node_modules
        npm install
        cd client && npm install
        cd ../server && npm install
        echo "✅ Clean installation complete!"
        ;;
    "help"|""|"-h"|"--help")
        print_usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        print_usage
        exit 1
        ;;
esac 