# ⚡ Quick Start - Deploy Encriptofy in 5 Minutes

## 🚀 Super Fast Deployment

### Option 1: Automated Deployment (Recommended)

1. **Run the deployment script:**
```bash
./deploy.sh
```

2. **Follow the prompts** - the script will guide you through everything!

### Option 2: Manual Deployment

#### Step 1: Deploy Backend (Railway)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `/server`
6. Add environment variables (see below)
7. Deploy!

#### Step 2: Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set root directory to `/client`
6. Add environment variables (see below)
7. Deploy!

## 🔧 Required Environment Variables

### Railway (Backend)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/encriptofy
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=90d
PORT=5000
```

### Vercel (Frontend)
```env
VITE_API_URL=https://your-app.railway.app
```

## 🗄️ Quick Database Setup

1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free account
3. Create cluster (Free tier)
4. Get connection string
5. Add to Railway environment variables

## ✅ Test Your Deployment

1. **Backend:** Visit `https://your-app.railway.app/api/health`
2. **Frontend:** Visit `https://your-app.vercel.app`
3. **Full App:** Register and test encryption features

## 🆘 Need Help?

- **Detailed Guide:** See `DEPLOYMENT_GUIDE.md`
- **Troubleshooting:** Check logs in Railway/Vercel dashboards
- **Issues:** Review common problems in the main guide

---

**🎉 That's it! Your app will be live in minutes!** 