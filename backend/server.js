const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/config');

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}...`);
  console.log(`🌐 Environment: ${config.env}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
