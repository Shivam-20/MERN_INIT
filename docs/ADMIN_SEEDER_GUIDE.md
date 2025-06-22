# Admin User Seeder Guide

This guide explains how to use the admin user seeder functionality in Encriptofy to initialize and manage admin credentials.

## 📋 Overview

The admin seeder is a utility that automatically creates admin user accounts based on environment variables. It ensures that your application always has a valid admin user available for management tasks.

## 🔧 Configuration

### Environment Variables

Set these variables in your `.env` file:

```env
# Admin User Configuration
ADMIN_EMAIL=admin@encriptofy.com
ADMIN_PASSWORD=ChangeThisSecurePassword123!
ADMIN_NAME=System Administrator
```

### Required Variables:
- `ADMIN_EMAIL`: Admin user's email address (used for login)
- `ADMIN_PASSWORD`: Admin user's password (minimum 8 characters)

### Optional Variables:
- `ADMIN_NAME`: Display name for the admin user (defaults to "System Administrator")

## 🚀 Usage

### 1. Automatic Seeding (Recommended)

The admin user is automatically created when the server starts:

```bash
# Start the server - admin user will be seeded automatically
npm start
# or
./dev.sh start
```

### 2. Manual Seeding

Run the seeder manually when needed:

```bash
# Using npm scripts
cd server
npm run seed:admin

# Using dev helper
./dev.sh seed admin

# Direct script execution
node server/scripts/seedAdmin.js
```

### 3. Docker Environment

Run seeder in Docker containers:

```bash
# Validate configuration
docker exec encriptofy-backend npm run seed:admin:validate

# Run seeder
docker exec encriptofy-backend npm run seed:admin

# Check statistics
docker exec encriptofy-backend npm run seed:admin:stats
```

## 📊 Available Commands

### Validation
```bash
npm run seed:admin:validate
# or
./dev.sh seed admin validate
```
Validates admin configuration without creating users.

### Statistics
```bash
npm run seed:admin:stats
# or
./dev.sh seed admin stats
```
Shows database statistics including user counts.

### Help
```bash
node server/scripts/seedAdmin.js --help
```
Shows detailed usage information.

## ✅ Features

### Smart Seeding
- **Idempotent**: Safe to run multiple times
- **Update Detection**: Updates credentials if they change
- **Validation**: Checks configuration before seeding
- **Error Handling**: Graceful failure with helpful messages

### Security Features
- **Password Hashing**: Automatically hashes passwords using bcrypt
- **Weak Password Detection**: Warns about common weak passwords
- **Email Validation**: Validates email format
- **Role Enforcement**: Ensures admin role is properly set

## 🔒 Security Best Practices

### Strong Passwords
```env
# ❌ Weak (will show warning)
ADMIN_PASSWORD=admin123

# ✅ Strong
ADMIN_PASSWORD=MySecure_Admin_Pass_2024!
```

### Environment Security
```bash
# Secure your .env file
chmod 600 .env

# Never commit .env to version control
echo ".env" >> .gitignore
```

### Production Deployment
- Use strong, unique passwords
- Regularly rotate admin credentials
- Use environment-specific configurations
- Monitor admin access logs

## 📝 Example Output

### Successful Seeding
```
🌱 Starting Admin User Seeder...
=====================================
✅ Admin configuration validation passed
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
🌱 Checking admin user initialization...
🔧 Creating admin user...
✅ Admin user created successfully
   Email: admin@encriptofy.com
   Name: System Administrator
   Role: admin

📊 Database Statistics:
========================
Total Users: 1
Total Admins: 1
Active Admins: 1
Admin Percentage: 100.00%

✅ Admin seeder completed successfully!
=====================================
```

### Configuration Validation Error
```
❌ Admin configuration validation failed:
   - ADMIN_EMAIL is not set
   - ADMIN_PASSWORD must be at least 8 characters long

Please check your .env file and try again.
```

## 🔍 Testing Admin Login

### API Test
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@encriptofy.com",
    "password": "ChangeThisSecurePassword123!",
    "isAdmin": true
  }'
```

### Expected Response
```json
{
  "success": true,
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6857eaba777034d52566a46b",
    "name": "System Administrator",
    "email": "admin@encriptofy.com",
    "role": "admin"
  }
}
```

## 🎯 Frontend Usage

### Admin Login Component
The seeded admin credentials can be used with the admin login:

```javascript
// Login as admin
const response = await authService.adminLogin(
  'admin@encriptofy.com',
  'ChangeThisSecurePassword123!'
);
```

### Admin Dashboard Access
After successful login, access the admin dashboard at:
- http://localhost:3000/admin/dashboard

## 🛠️ Troubleshooting

### Common Issues

#### "Admin configuration validation failed"
**Solution**: Check your `.env` file has the required variables.

#### "MongoDB connection failed"
**Solution**: Verify your `MONGODB_URI` is correct and MongoDB is running.

#### "Admin user with this email already exists"
**Solution**: This is normal - the seeder detects existing users and updates them if needed.

#### "Weak password warning"
**Solution**: Use a stronger password meeting security requirements.

### Debug Mode
Enable verbose logging by setting:
```env
NODE_ENV=development
```

## 🔄 Integration Points

### Server Startup
The seeder is automatically called during server initialization in `server/index.js`.

### Docker Containers
Seeding works seamlessly in Docker environments with MongoDB Atlas.

### Testing
The seeder is skipped during test runs (`NODE_ENV=test`).

## 📂 File Structure

```
server/
├── scripts/
│   └── seedAdmin.js          # Standalone seeder script
├── utils/
│   └── seedAdmin.js          # Seeder utility functions
├── models/
│   └── User.js               # User model with admin support
└── index.js                  # Server startup with auto-seeding
```

## 🚀 Next Steps

After setting up the admin user:

1. **Test Login**: Verify admin credentials work
2. **Access Dashboard**: Navigate to `/admin/dashboard`
3. **Create Users**: Use admin interface to manage users
4. **Security Review**: Ensure strong passwords and proper access controls
5. **Monitoring**: Set up logging for admin activities

---

**✅ Your admin user is now properly configured and ready to use!** 