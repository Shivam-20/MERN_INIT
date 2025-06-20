# File Organization Guide

**Date Organized:** December 2024  
**Reorganization:** Major project structure cleanup

## 🎯 Organization Goals

The Encriptofy project has been reorganized to improve:
- **Developer Experience** - Easier navigation and development
- **Project Maintainability** - Clear separation of concerns
- **Build/Deploy Clarity** - Organized scripts and configurations
- **Documentation** - Centralized and accessible docs

## 📁 New Directory Structure

```
encriptofy/
├── 📄 README.md                 # Main project documentation
├── 📄 package.json              # Root dependencies and scripts
├── 📄 dev.sh                    # Development helper script
├── 📄 .gitignore               # Git ignore patterns
├── 📄 package-lock.json        # Dependency lock file
├── 
├── 📂 client/                   # Frontend React application
│   ├── src/                    # React source code
│   ├── public/                 # Static assets
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind configuration
│
├── 📂 server/                   # Backend Node.js application
│   ├── __tests__/              # Test files
│   │   ├── controllers/        # Controller tests
│   │   ├── models/             # Model tests
│   │   ├── routes/             # Route tests
│   │   └── utils/              # Utility tests
│   ├── config/                 # Server configuration
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Custom middleware
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── utils/                  # Utility functions
│   ├── index.js                # Main server file
│   └── package.json            # Backend dependencies
│
├── 📂 docs/                     # All documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── DOCUMENTATION_GUIDE.md  # How to maintain docs
│   ├── FILE_ORGANIZATION.md    # This file
│   ├── ISSUES_FIXED.md         # Fixed issues summary
│   ├── PROJECT_DOCUMENTATION.md # Detailed project docs
│   └── PROJECT_STATE_DOCUMENTATION.md # Current state
│
├── 📂 scripts/                  # Build and deployment scripts
│   ├── backup.sh               # Database backup
│   ├── deploy-prod.sh          # Production deployment
│   ├── docker-compose.sh       # Docker management
│   ├── generate-ssl.sh         # SSL certificate generation
│   ├── healthcheck.sh          # Health monitoring
│   ├── setup-dev.sh            # Development setup
│   └── update-docs.sh          # Documentation updates
│
├── 📂 docker/                   # Docker configuration
│   ├── nginx/                  # Nginx configuration
│   │   ├── conf.d/             # Nginx site configs
│   │   ├── nginx.conf          # Main Nginx config
│   │   └── ssl/                # SSL certificates
│   ├── docker-compose.yml      # Development Docker setup
│   ├── docker-compose.prod.yml # Production Docker setup
│   ├── Dockerfile              # Production Dockerfile
│   ├── Dockerfile.dev          # Development Dockerfile
│   ├── Dockerfile.nginx        # Nginx Dockerfile
│   └── .dockerignore           # Docker ignore patterns
│
└── 📂 config/                   # Configuration templates
    ├── env.example             # Environment template
    └── backup.config           # Backup configuration
```

## 🔄 What Changed

### Files Moved

#### Documentation → `docs/`
- `DEPLOYMENT.md` → `docs/DEPLOYMENT.md`
- `DOCUMENTATION_GUIDE.md` → `docs/DOCUMENTATION_GUIDE.md`
- `ISSUES_FIXED.md` → `docs/ISSUES_FIXED.md`
- `PROJECT_*.md` → `docs/PROJECT_*.md`

#### Scripts → `scripts/`
- `*.sh` files → `scripts/*.sh`
- All executable scripts now in one location

#### Docker Files → `docker/`
- `docker-compose.yml` → `docker/docker-compose.yml`
- `docker-compose.prod.yml` → `docker/docker-compose.prod.yml`
- `Dockerfile*` → `docker/Dockerfile*`
- `nginx/` → `docker/nginx/`
- `.dockerignore` → `docker/.dockerignore`

#### Configuration → `config/`
- `env.example` → `config/env.example`
- `backup.config` → `config/backup.config`

### Files Removed
- `test-password.js` - Replaced by proper tests
- `backend/` directory - Only contained coverage reports

### New Files Created
- `dev.sh` - Development helper script
- `docs/FILE_ORGANIZATION.md` - This file

## 🚀 Using the New Structure

### Development Commands

```bash
# Quick start
./dev.sh setup    # Setup environment
./dev.sh start    # Start development
./dev.sh test     # Run tests
./dev.sh docker   # Use Docker

# Using npm scripts
npm run setup     # Same as ./dev.sh setup
npm run dev       # Start development
npm run docker    # Docker management
npm run docs      # Update documentation
```

### Script Access

All scripts are now in `scripts/` directory:
```bash
./scripts/setup-dev.sh          # Development setup
./scripts/docker-compose.sh dev # Docker development
./scripts/deploy-prod.sh         # Production deployment
./scripts/backup.sh              # Create backups
./scripts/healthcheck.sh         # Health monitoring
./scripts/update-docs.sh         # Update documentation
```

### Docker Usage

Docker files are in `docker/` directory:
```bash
# From project root
cd docker
docker-compose up              # Development
docker-compose -f docker-compose.prod.yml up  # Production

# Or use the helper
./scripts/docker-compose.sh dev   # Development
./scripts/docker-compose.sh prod  # Production
```

### Documentation Access

All documentation in `docs/` directory:
- `docs/README.md` - You are here
- `docs/DEPLOYMENT.md` - How to deploy
- `docs/DOCUMENTATION_GUIDE.md` - How to maintain docs
- `docs/PROJECT_STATE_DOCUMENTATION.md` - Current project state

## 🔧 Configuration

### Environment Setup
```bash
# Copy environment template
cp config/env.example .env

# Edit your settings
nano .env
```

### Backup Configuration
```bash
# Edit backup settings
nano config/backup.config
```

## 📊 Benefits of New Structure

### ✅ Developer Experience
- **Cleaner Root** - Only essential files in root directory
- **Logical Grouping** - Related files are together
- **Easy Navigation** - Clear directory purposes
- **Quick Access** - `dev.sh` script for common tasks

### ✅ Maintainability
- **Separated Concerns** - Each directory has a specific purpose
- **Consistent Patterns** - Similar files are grouped
- **Version Control** - Better diff and merge handling
- **Documentation** - All docs in one place

### ✅ Build/Deploy
- **Docker Organization** - All container configs together
- **Script Management** - All automation scripts centralized
- **Configuration** - Templates and configs organized
- **Deployment** - Clear deployment process

### ✅ Team Collaboration
- **Onboarding** - New developers can easily understand structure
- **Standards** - Consistent file organization
- **Documentation** - Easy to find and maintain
- **Tools** - Helper scripts reduce complexity

## 🔍 Finding Files

### Common File Locations

| What you need | Where to find it |
|---------------|------------------|
| Start development | `./dev.sh start` |
| Environment template | `config/env.example` |
| Docker setup | `docker/docker-compose.yml` |
| Deployment guide | `docs/DEPLOYMENT.md` |
| API documentation | `docs/PROJECT_DOCUMENTATION.md` |
| Run tests | `./dev.sh test` |
| Create backup | `./scripts/backup.sh` |
| Deploy production | `./scripts/deploy-prod.sh` |
| Update docs | `./scripts/update-docs.sh` |

### Quick Reference Commands

```bash
# Development
./dev.sh help              # Show all commands
./dev.sh setup             # Initial setup
./dev.sh start             # Start development
./dev.sh test              # Run tests
./dev.sh clean             # Clean install

# Docker
./dev.sh docker dev        # Docker development
./dev.sh docker prod       # Docker production

# Maintenance
./dev.sh docs              # Update documentation
./dev.sh backup            # Create backup
./dev.sh health            # Health check
./dev.sh deploy            # Deploy to production
```

## 📝 Migration Notes

### For Existing Users

If you were using the old structure:

1. **Update your scripts** - Use new paths for Docker files
2. **Update documentation links** - Files moved to `docs/`
3. **Use helper script** - `./dev.sh` for common tasks
4. **Environment file** - Copy from `config/env.example`

### Path Updates

| Old Path | New Path |
|----------|----------|
| `docker-compose.yml` | `docker/docker-compose.yml` |
| `DEPLOYMENT.md` | `docs/DEPLOYMENT.md` |
| `.env.example` | `config/env.example` |
| `setup-dev.sh` | `scripts/setup-dev.sh` |

---

**This organization structure makes the project more professional, maintainable, and developer-friendly!** 