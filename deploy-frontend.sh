#!/bin/bash

# Frontend Deployment Script for Vercel
echo "🚀 Deploying Frontend to Vercel..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Frontend deployment complete!"
echo "🌍 Your app is now live at: https://your-app.vercel.app" 