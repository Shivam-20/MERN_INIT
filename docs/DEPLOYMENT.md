# Encriptofy - Deployment and Operations Guide

This document provides detailed instructions for deploying and operating the Encriptofy application in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Environment Setup](#development-environment-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Configuration](#docker-configuration)
5. [Backup and Restore](#backup-and-restore)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Scaling](#scaling)
9. [Security](#security)
10. [Updates and Upgrades](#updates-and-upgrades)

## Prerequisites

### System Requirements

- **Development**:
  - Docker 20.10+ and Docker Compose 1.29+
  - Node.js 16+ and npm 8+
  - Git

- **Production**:
  - Linux server (Ubuntu 20.04+ recommended)
  - Docker 20.10+ and Docker Compose 1.29+
  - Minimum 2 CPU cores, 4GB RAM, 20GB disk space
  - Domain name with DNS configured (recommended)
  - SSL certificates (Let's Encrypt recommended)

### Required Ports

- **Development**:
  - 3000: Frontend development server
  - 5000: Backend API server
  - 27017: MongoDB database

- **Production**:
  - 80: HTTP (redirects to HTTPS)
  - 443: HTTPS
  - 5000: Backend API (internal)
  - 27017: MongoDB (internal)

## Development Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/encriptofy.git
   cd encriptofy
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the setup script**:
   ```bash
   chmod +x setup-dev.sh
   ./setup-dev.sh
   ```

4. **Start the development environment**:
   ```bash
   ./docker-compose.sh dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017/encriptofy

## Production Deployment

### Manual Deployment

1. **Prepare the server**:
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy the application**:
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/encriptofy.git
   cd encriptofy
   
   # Set up environment variables
   cp .env.example .env.production
   # Edit .env.production with your production configuration
   
   # Generate SSL certificates
   mkdir -p nginx/ssl
   ./generate-ssl.sh
   
   # Build and start the application
   ./deploy-prod.sh
   ```

3. **Set up a reverse proxy (Nginx)**:
   The application includes an Nginx configuration in the `nginx/` directory. You can use this as a reference to set up your production web server.

### Automated Deployment with CI/CD

1. **GitHub Actions**:
   The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that can automatically build and deploy the application to your production server.

2. **Configuration**:
   - Set up the following secrets in your GitHub repository:
     - `SSH_PRIVATE_KEY`: Private key for SSH access to your server
     - `SERVER_IP`: IP address of your production server
     - `SERVER_USER`: SSH username
     - `DOMAIN`: Your domain name (optional)

## Docker Configuration

### Development

- **docker-compose.yml**: Development configuration with hot-reload for both frontend and backend
- **Dockerfile.dev**: Development Dockerfile with development dependencies

### Production

- **docker-compose.prod.yml**: Production configuration with optimized settings
- **Dockerfile**: Production Dockerfile with multi-stage build
- **Dockerfile.nginx**: Nginx configuration for serving the frontend

### Environment Variables

See `.env.example` for a complete list of environment variables that can be configured.

## Backup and Restore

### Creating Backups

```bash
# Create a backup
./backup.sh

# Create a backup with custom name and directory
./backup.sh -d /mnt/backups -n custom_backup

# List available backups
./backup.sh --list

# Restore from a backup
./backup.sh --restore backups/encriptofy_backup_20230101_120000.tar.gz

# Set up automatic daily backups
./backup.sh --setup-cron
```

### Backup Configuration

Edit `backup.config` to customize backup settings:
- Backup directory
- Retention policy
- Compression settings
- Email notifications
- Remote backup destinations

## Monitoring and Maintenance

### Health Checks

```bash
# Run a basic health check
./healthcheck.sh

# Run a detailed health check
./healthcheck.sh -v

# Check specific components
./healthcheck.sh --no-frontend --no-backend
```

### Logs

```bash
# View logs for all services
docker-compose -f docker-compose.prod.yml logs -f

# View logs for a specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# View MongoDB logs
docker-compose -f docker-compose.prod.yml logs -f mongodb
```

### Maintenance Tasks

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx sequelize-cli db:migrate

# Run database seeders
docker-compose -f docker-compose.prod.yml exec backend npx sequelize-cli db:seed:all

# Access MongoDB shell
docker-compose -f docker-compose.prod.yml exec mongodb mongo encriptofy
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Ensure no other services are using ports 80, 443, 3000, or 5000
   - Check with `sudo lsof -i :<port>`

2. **Docker permission denied**:
   - Add your user to the docker group: `sudo usermod -aG docker $USER`
   - Log out and log back in for changes to take effect

3. **MongoDB connection issues**:
   - Check if MongoDB is running: `docker ps | grep mongo`
   - View MongoDB logs: `docker-compose logs mongodb`

4. **Build failures**:
   - Clean Docker cache: `docker system prune -f`
   - Rebuild with `--no-cache`: `docker-compose build --no-cache`

### Debugging

```bash
# Run a shell in a running container
docker-compose -f docker-compose.prod.yml exec backend sh

# Inspect container configuration
docker inspect <container_id>

# View resource usage
docker stats
```

## Scaling

### Horizontal Scaling

1. **Backend API**:
   ```yaml
   # In docker-compose.prod.yml
   backend:
     image: encriptofy-backend
     deploy:
       replicas: 3
       resources:
         limits:
           cpus: '0.5'
           memory: 512M
   ```

2. **MongoDB Replica Set**:
   For production, consider setting up a MongoDB replica set for high availability.

### Load Balancing

Use a load balancer (e.g., Nginx, HAProxy) to distribute traffic across multiple backend instances.

## Security

### Best Practices

1. **Docker Security**:
   - Run containers as non-root users
   - Use read-only filesystems where possible
   - Limit container capabilities

2. **Network Security**:
   - Use internal Docker networks
   - Restrict container communication
   - Enable TLS for all services

3. **Secrets Management**:
   - Use Docker secrets or environment variables for sensitive data
   - Never commit secrets to version control

### SSL/TLS

- The application is configured to use HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Automate certificate renewal with Certbot

## Updates and Upgrades

### Application Updates

1. **Manual Update**:
   ```bash
   git pull origin main
   ./deploy-prod.sh --no-cache
   ```

2. **Rolling Back**:
   ```bash
   # Find the previous working version
   git log --oneline
   
   # Checkout the previous version
   git checkout <commit-hash>
   
   # Rebuild and restart
   ./deploy-prod.sh
   ```

### Dependency Updates

1. **Backend Dependencies**:
   ```bash
   cd server
   npm outdated
   npm update
   npm audit fix
   ```

2. **Frontend Dependencies**:
   ```bash
   cd client
   npm outdated
   npm update
   npm audit fix
   ```

3. **Docker Images**:
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Support

For support, please open an issue in the GitHub repository or contact the development team.
