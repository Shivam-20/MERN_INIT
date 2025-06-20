# Database Setup Guide

This guide covers setting up MongoDB for the Encriptofy application, including both local development and MongoDB Atlas production setup.

## 📋 Table of Contents

1. [Development Setup (Local MongoDB)](#development-setup-local-mongodb)
2. [Production Setup (MongoDB Atlas)](#production-setup-mongodb-atlas)
3. [Environment Configuration](#environment-configuration)
4. [Database Schema](#database-schema)
5. [Troubleshooting](#troubleshooting)

## 🛠️ Development Setup (Local MongoDB)

### Prerequisites
- Node.js 16+ installed
- MongoDB Community Server installed locally

### Install MongoDB Locally

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Linux
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Verify Installation
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

## ☁️ Production Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new project named "Encryptofy"

### Step 2: Create a Cluster
1. Click "Create a New Cluster"
2. Choose the free tier (M0 Sandbox)
3. Select your preferred region
4. Name your cluster "encryptofy"

### Step 3: Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Username: `encryptofy`
4. Password: Generate a secure password (save it securely!)
5. Set permissions to "Read and write to any database"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Add your current IP
4. For production: Add your server's IP address
5. For testing: You can add `0.0.0.0/0` (⚠️ **Not recommended for production!**)

### Step 5: Get Connection String
1. Go to "Clusters" and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string

**Your connection string should look like:**
```
mongodb+srv://encryptofy:<db_password>@encryptofy.dkgjyx7.mongodb.net/?retryWrites=true&w=majority&appName=Encryptofy
```

## ⚙️ Environment Configuration

### Development Environment
Copy the environment template:
```bash
cp config/env.example .env
```

For **local development**, use:
```env
MONGODB_URI=mongodb://localhost:27017/encriptofy
```

### Production Environment
For **MongoDB Atlas production**, update your `.env`:
```env
MONGODB_URI=mongodb+srv://encryptofy:YOUR_ACTUAL_PASSWORD@encryptofy.dkgjyx7.mongodb.net/?retryWrites=true&w=majority&appName=Encryptofy
```

Replace `YOUR_ACTUAL_PASSWORD` with the password you created for the `encryptofy` user.

### Testing Environment
For **testing**, optionally set:
```env
MONGODB_URI_TEST=mongodb://localhost:27017/encriptofy_test
```

## 🗄️ Database Schema

The application uses the following collections:

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  active: Boolean (default: true),
  passwordChangedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
The application automatically creates these indexes:
- `email` (unique)
- `role`
- `active`

## 🧪 Database Testing

### Test Your Connection
```bash
# Run the application
./dev.sh start

# Check server logs for successful connection
# You should see: "✅ Environment validation passed"
# And: "MongoDB connected successfully"
```

### Using MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse your database and collections

### Using MongoDB Shell
```bash
# Connect to local MongoDB
mongosh

# Connect to MongoDB Atlas
mongosh "mongodb+srv://encryptofy:<password>@encryptofy.dkgjyx7.mongodb.net/"

# Show databases
show dbs

# Use your database
use encriptofy

# Show collections
show collections

# Find all users
db.users.find()
```

## 🔧 Troubleshooting

### Common Issues

#### "Connection Refused" Error
```bash
# Check if MongoDB is running locally
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod
```

#### "Authentication Failed" (Atlas)
- ✅ Check username and password are correct
- ✅ Ensure user has proper permissions
- ✅ Verify your IP address is whitelisted

#### "Network Timeout" (Atlas)
- ✅ Check your internet connection
- ✅ Verify network access settings in Atlas
- ✅ Check firewall settings

#### "Database Not Found"
The database will be created automatically when you first insert data.

### Environment Validation
The application includes automatic environment validation:
```bash
# This will check your MongoDB URI format
npm start
```

### Testing Connection Manually
Create a test file to verify your connection:
```javascript
// test-connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
```

Run the test:
```bash
node test-connection.js
```

## 📊 Performance Tips

### For Local Development
- Use MongoDB Community Server (faster than Docker for development)
- Create indexes for fields you query frequently
- Use MongoDB Compass for visual database management

### For Production (Atlas)
- Choose the nearest region to your users
- Enable backup (available in paid tiers)
- Monitor performance through Atlas dashboard
- Use connection pooling (handled automatically by Mongoose)

## 🔒 Security Best Practices

### MongoDB Atlas
- ✅ Use strong passwords for database users
- ✅ Restrict IP access to known addresses
- ✅ Enable two-factor authentication on your Atlas account
- ✅ Regularly rotate database passwords
- ✅ Use database-level user permissions

### Application Level
- ✅ Never expose connection strings in code
- ✅ Use environment variables for secrets
- ✅ Enable MongoDB's built-in security features
- ✅ Validate all input data
- ✅ Use Mongoose schema validation

## 🚀 Next Steps

After setting up your database:

1. **Test the connection**: `./dev.sh start`
2. **Create your first user**: Use the registration endpoint
3. **Check the admin user**: Verify admin account creation
4. **Run tests**: `./dev.sh test`
5. **Monitor**: Use MongoDB Atlas dashboard or local logs

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your environment variables
3. Test the connection manually
4. Check MongoDB Atlas documentation
5. Review application logs

---

**✅ Your database should now be properly configured for the Encriptofy application!**