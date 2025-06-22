import User from '../models/User.js';
import { validateEnvironment } from './validateEnv.js';

/**
 * Seed admin user from environment variables
 * This function creates an admin user if one doesn't exist
 */
export const seedAdminUser = async () => {
  try {
    console.log('🌱 Checking admin user initialization...');
    
    // Validate required environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';
    
    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  Admin credentials not configured in environment variables');
      console.warn('   Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file');
      return false;
    }
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminEmail },
        { role: 'admin' }
      ]
    }).select('+password');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      
      // Update admin user if credentials have changed
      let updated = false;
      
      if (existingAdmin.email !== adminEmail) {
        existingAdmin.email = adminEmail;
        updated = true;
      }
      
      if (existingAdmin.name !== adminName) {
        existingAdmin.name = adminName;
        updated = true;
      }
      
      // Check if password needs updating (only if different)
      const isPasswordSame = await existingAdmin.correctPassword(adminPassword);
      if (!isPasswordSame) {
        existingAdmin.password = adminPassword;
        updated = true;
      }
      
      if (updated) {
        await existingAdmin.save();
        console.log('🔄 Admin user credentials updated');
      }
      
      return existingAdmin;
    }
    
    // Create new admin user
    console.log('🔧 Creating admin user...');
    
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: admin`);
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      console.error('   Admin user with this email already exists');
      return await User.findOne({ email: process.env.ADMIN_EMAIL });
    }
    
    throw error;
  }
};

/**
 * Seed multiple admin users from configuration
 */
export const seedMultipleAdmins = async (adminConfigs) => {
  try {
    console.log('🌱 Seeding multiple admin users...');
    
    const results = [];
    
    for (const config of adminConfigs) {
      const { name, email, password, role = 'admin' } = config;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        console.log(`ℹ️  User already exists: ${email}`);
        results.push(existingUser);
        continue;
      }
      
      // Create new user
      const user = new User({
        name,
        email,
        password,
        role,
        isActive: true
      });
      
      await user.save();
      results.push(user);
      
      console.log(`✅ Created ${role}: ${email}`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error seeding multiple admins:', error.message);
    throw error;
  }
};

/**
 * Validate admin user configuration
 */
export const validateAdminConfig = () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  const issues = [];
  
  if (!adminEmail) {
    issues.push('ADMIN_EMAIL is not set');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    issues.push('ADMIN_EMAIL is not a valid email format');
  }
  
  if (!adminPassword) {
    issues.push('ADMIN_PASSWORD is not set');
  } else if (adminPassword.length < 8) {
    issues.push('ADMIN_PASSWORD must be at least 8 characters long');
  } else if (adminPassword === 'admin123' || adminPassword === 'password') {
    issues.push('ADMIN_PASSWORD is using a default/weak password');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Get admin user statistics
 */
export const getAdminStats = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
    
    return {
      totalUsers,
      totalAdmins,
      activeAdmins,
      adminPercentage: totalUsers > 0 ? ((totalAdmins / totalUsers) * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return null;
  }
};

export default {
  seedAdminUser,
  seedMultipleAdmins,
  validateAdminConfig,
  getAdminStats
}; 