# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install root dependencies
RUN npm install --legacy-peer-deps

# Install server dependencies
WORKDIR /app/server
RUN npm install --omit=dev

# Install client dependencies and build
WORKDIR /app/client
RUN npm install --legacy-peer-deps
RUN npm run build

# Production stage
FROM node:18-alpine

# Install system dependencies
RUN apk --no-cache add dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Copy built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the application port
EXPOSE 5000

# Set the command to run the application
CMD ["dumb-init", "node", "server/index.js"]
