#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Setting up Encriptofy development environment...${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✓ Node.js is already installed${NC}"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Installing npm...${NC}"
    sudo apt-get install -y npm
else
    echo -e "${GREEN}✓ npm is already installed${NC}"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the stable repository
    echo \
      "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed. Please log out and log back in for group changes to take effect.${NC}"
else
    echo -e "${GREEN}✓ Docker is already installed${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose is not installed. Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}✓ Docker Compose is already installed${NC}"
fi

# Install root dependencies
echo -e "\n${YELLOW}Installing root dependencies...${NC}"
npm install

# Install server dependencies
echo -e "\n${YELLOW}Installing server dependencies...${NC}"
cd server
npm install
cd ..

# Install client dependencies
echo -e "\n${YELLOW}Installing client dependencies...${NC}"
cd client
npm install
cd ..

# Set up environment files
echo -e "\n${YELLOW}Setting up environment files...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}Please update the .env file with your configuration.${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo -e "${YELLOW}Please verify the configuration in the .env file.${NC}"
fi

# Generate SSL certificates for development
echo -e "\n${YELLOW}Generating SSL certificates for development...${NC}"
chmod +x generate-ssl.sh
./generate-ssl.sh

# Make scripts executable
echo -e "\n${YELLOW}Making scripts executable...${NC}"
chmod +x docker-compose.sh
chmod +x generate-ssl.sh

# Display completion message
echo -e "\n${GREEN}✅ Development environment setup complete!${NC}"
echo -e "\n${YELLOW}To start the development environment, run:${NC}"
echo -e "  ${GREEN}./docker-compose.sh dev${NC}"
echo -e "\n${YELLOW}For production deployment, run:${NC}"
echo -e "  ${GREEN}./docker-compose.sh prod --build${NC}"
echo -e "\n${YELLOW}For more options, run:${NC}"
echo -e "  ${GREEN}./docker-compose.sh --help${NC}"
