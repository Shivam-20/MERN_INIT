const mongoose = require('mongoose');
const config = require('./config');

// Remove Mongoose deprecation warning
mongoose.set('strictQuery', true);

// MongoDB connection options
const options = {
  ...config.database.options,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  heartbeatFrequencyMS: 10000, // Check server status every 10s
  retryWrites: true,
  w: 'majority'
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
  // Exit process with failure
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️  MongoDB disconnected');
});

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.database.uri, options);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
