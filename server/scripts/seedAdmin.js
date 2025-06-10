import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/encriptofy';

// Admin user data
const adminData = {
  name: 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  role: 'admin',
  active: true
};

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    // Define User schema
    const userSchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
      },
      email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
      },
      role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
      },
      active: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    });

    // Hash password before saving
    userSchema.pre('save', async function (next) {
      if (!this.isModified('password')) return next();
      
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error);
      }
    });

    // Create User model
    const User = mongoose.model('User', userSchema);

    try {
      // Check if admin user already exists
      const existingAdmin = await User.findOne({ email: adminData.email });
      
      if (existingAdmin) {
        console.log('Admin user already exists');
      } else {
        // Create new admin user
        const newAdmin = new User(adminData);
        await newAdmin.save();
        console.log('Admin user created successfully');
      }
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
      process.exit(0);
    } catch (error) {
      console.error('Error seeding admin user:', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
