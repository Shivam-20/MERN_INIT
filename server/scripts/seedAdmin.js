#!/usr/bin/env node

/**
 * Admin User Seeder Script
 * 
 * This script initializes admin users for the Encriptofy application.
 * It can be run standalone or as part of the application startup.
 * 
 * Usage:
 *   node scripts/seedAdmin.js
 *   npm run seed:admin
 * 
 * Environment variables required:
 *   ADMIN_EMAIL - Admin user email
 *   ADMIN_PASSWORD - Admin user password
 *   ADMIN_NAME - Admin user name (optional)
 *   MONGODB_URI - Database connection string
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedAdminUser, validateAdminConfig, getAdminStats } from '../utils/seedAdmin.js';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/encriptofy';
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('📴 MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
};

/**
 * Main seeder function
 */
const runSeeder = async () => {
  try {
    console.log('🌱 Starting Admin User Seeder...');
    console.log('=====================================');
    
    // Validate admin configuration
    const validation = validateAdminConfig();
    if (!validation.isValid) {
      console.error('❌ Admin configuration validation failed:');
      validation.issues.forEach(issue => console.error(`   - ${issue}`));
      console.error('\nPlease check your .env file and try again.');
      process.exit(1);
    }
    
    console.log('✅ Admin configuration validation passed');
    
    // Connect to database
    await connectDB();
    
    // Seed admin user
    const admin = await seedAdminUser();
    
    if (!admin) {
      console.warn('⚠️  No admin user was created (configuration missing)');
      await disconnectDB();
      process.exit(1);
    }
    
    // Get and display stats
    console.log('\n📊 Database Statistics:');
    console.log('========================');
    
    const stats = await getAdminStats();
    if (stats) {
      console.log(`Total Users: ${stats.totalUsers}`);
      console.log(`Total Admins: ${stats.totalAdmins}`);
      console.log(`Active Admins: ${stats.activeAdmins}`);
      console.log(`Admin Percentage: ${stats.adminPercentage}%`);
    }
    
    console.log('\n✅ Admin seeder completed successfully!');
    console.log('=====================================');
    
    await disconnectDB();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

/**
 * Handle script arguments
 */
const handleArguments = () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Admin User Seeder - Encriptofy

Usage:
  node scripts/seedAdmin.js [options]

Options:
  --help, -h     Show this help message
  --validate     Only validate configuration (don't seed)
  --stats        Show database statistics only

Environment Variables:
  ADMIN_EMAIL     Admin user email address (required)
  ADMIN_PASSWORD  Admin user password (required)
  ADMIN_NAME      Admin user display name (optional)
  MONGODB_URI     Database connection string (required)

Examples:
  node scripts/seedAdmin.js
  node scripts/seedAdmin.js --validate
  node scripts/seedAdmin.js --stats
`);
    process.exit(0);
  }
  
  if (args.includes('--validate')) {
    console.log('🔍 Validating admin configuration...');
    const validation = validateAdminConfig();
    
    if (validation.isValid) {
      console.log('✅ Admin configuration is valid');
      process.exit(0);
    } else {
      console.error('❌ Admin configuration validation failed:');
      validation.issues.forEach(issue => console.error(`   - ${issue}`));
      process.exit(1);
    }
  }
  
  if (args.includes('--stats')) {
    connectDB().then(async () => {
      const stats = await getAdminStats();
      if (stats) {
        console.log('📊 Database Statistics:');
        console.log(`Total Users: ${stats.totalUsers}`);
        console.log(`Total Admins: ${stats.totalAdmins}`);
        console.log(`Active Admins: ${stats.activeAdmins}`);
        console.log(`Admin Percentage: ${stats.adminPercentage}%`);
      }
      await disconnectDB();
      process.exit(0);
    });
    return;
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  handleArguments();
  runSeeder();
} 