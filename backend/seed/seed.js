const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const { promisify } = require('util');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to DB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connection successful!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Delete all data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.error('Error deleting data:', err);
  }
  process.exit();
};

// Import data into DB
const importData = async () => {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@encriptofy.com',
      password: 'admin123',
      passwordConfirm: 'admin123',
      role: 'admin',
      active: true
    });
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@encriptofy.com');
    console.log('Password: admin123');
  } catch (err) {
    console.error('Error importing data:', err);
  }
  process.exit();
};

// Handle command line arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please specify --import or --delete');
  process.exit(1);
}
