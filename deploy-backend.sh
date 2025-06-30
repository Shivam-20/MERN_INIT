#!/bin/bash

# Backend Deployment Script for Railway
echo "🚀 Deploying Backend to Railway..."

# Navigate to server directory
cd server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to Railway
echo "🌐 Deploying to Railway..."
npx @railway/cli up

echo "✅ Backend deployment complete!"
echo "🔗 Your API is now live at: https://your-app.railway.app" 