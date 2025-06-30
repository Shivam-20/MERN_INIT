# 🚀 Free Deployment Guide for Encriptofy

This guide will help you deploy your Encriptofy application for free using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

1. **GitHub Account** - For code hosting
2. **Vercel Account** - For frontend hosting
3. **Railway Account** - For backend hosting
4. **MongoDB Atlas Account** - For database

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Set the root directory to `/server`**
7. **Add environment variables:**

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
PORT=5000
```

8. **Deploy the project**
9. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login with GitHub**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Add environment variables:**
```env
VITE_API_URL=https://your-app.railway.app
```

7. **Deploy the project**
8. **Copy your Vercel URL** (e.g., `https://your-app.vercel.app`)

### Step 4: Set Up MongoDB Atlas (Free Database)

1. **Go to [MongoDB Atlas](https://mongodb.com/atlas)**
2. **Create a free account**
3. **Create a new cluster (Free tier)**
4. **Set up database access:**
   - Create a database user
   - Set a strong password
5. **Set up network access:**
   - Allow access from anywhere (0.0.0.0/0)
6. **Get your connection string:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### Step 5: Update Environment Variables

#### Railway (Backend) Environment Variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/encriptofy?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=90d
PORT=5000
```

#### Vercel (Frontend) Environment Variables:
```env
VITE_API_URL=https://your-app.railway.app
```

### Step 6: Test Your Deployment

1. **Test the backend API:**
   - Visit: `https://your-app.railway.app/api/health`
   - Should return: `{"status":"success","message":"Server is running"}`

2. **Test the frontend:**
   - Visit: `https://your-app.vercel.app`
   - Should load your React application

3. **Test the full application:**
   - Register a new account
   - Try encrypting/decrypting text
   - Test file upload functionality

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Make sure your Railway URL is correct in Vercel environment variables
   - Check that CORS is properly configured in the backend

2. **Database Connection Issues:**
   - Verify MongoDB Atlas connection string
   - Check network access settings in MongoDB Atlas
   - Ensure the database user has proper permissions

3. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility
   - Check build logs in Vercel/Railway

4. **Environment Variables:**
   - Double-check all environment variables are set correctly
   - Restart deployments after changing environment variables

### Debug Commands:

```bash
# Check Railway logs
railway logs

# Check Vercel deployment status
vercel ls

# Test API locally
curl https://your-app.railway.app/api/health
```

## 📊 Monitoring Your Deployment

### Railway Monitoring:
- **Logs:** View real-time logs in Railway dashboard
- **Metrics:** Monitor CPU, memory usage
- **Deployments:** Track deployment history

### Vercel Monitoring:
- **Analytics:** View page views and performance
- **Functions:** Monitor serverless function usage
- **Deployments:** Track deployment status

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit secrets to Git
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database Security:**
   - Use strong database passwords
   - Enable MongoDB Atlas security features
   - Regular backups

3. **API Security:**
   - Rate limiting is already configured
   - CORS is properly set up
   - Input validation is implemented

## 💰 Cost Breakdown (Free Tier)

- **Vercel:** Free (100GB bandwidth/month)
- **Railway:** $5 free credit/month
- **MongoDB Atlas:** Free (512MB storage)
- **Total Cost:** $0/month

## 🚀 Next Steps

1. **Custom Domain:** Add your own domain to Vercel
2. **SSL Certificate:** Automatically provided by Vercel/Railway
3. **Monitoring:** Set up alerts for downtime
4. **Backup:** Configure automated database backups
5. **Scaling:** Upgrade plans as needed

## 📞 Support

If you encounter issues:

1. **Check the logs** in Railway/Vercel dashboards
2. **Review this guide** for common solutions
3. **Check the documentation** for each platform
4. **Contact support** if needed

---

**🎉 Congratulations!** Your Encriptofy application is now live and accessible worldwide for free! 