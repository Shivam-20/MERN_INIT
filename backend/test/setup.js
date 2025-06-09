// Load environment variables
require('dotenv').config({ path: '.env.test' });

// Use an in-memory MongoDB database for testing
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const request = require('supertest');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimiter = require('../middleware/rateLimiter');
const globalErrorHandler = require('../controllers/errorController');
const AppError = require('../utils/appError');
const userRoutes = require('../routes/userRoutes');
const authRoutes = require('../routes/authRoutes');

// Import middleware
// Import routes

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_COOKIE_EXPIRES_IN = '1';
process.env.PORT = '3001'; // Use a different port for tests
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE = 'mongodb://localhost:27017/encriptofy_test';

// Global test configuration
const TEST_PORT = process.env.PORT;

let mongoServer;

// Create and configure Express app for testing
const createApp = () => {
  const app = express();

  // 1) GLOBAL MIDDLEWARES
  // Enable CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Set security HTTP headers
  app.use(helmet());

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Apply rate limiting to API routes
  app.use('/api', rateLimiter.globalRateLimiter);
  app.use('/api/v1/auth', rateLimiter.authRateLimiter);

  // Body parser, reading data from body into req.body
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());
  
  // Data sanitization against XSS
  app.use(xss());
  
  // Prevent parameter pollution
  app.use(hpp({
    whitelist: ['sort', 'page', 'limit', 'fields']
  }));

  // Compression
  app.use(compression());

  // Test middleware
  app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });

  // 2) ROUTES
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });

  // Auth status endpoint
  app.get('/api/v1/auth/status', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Auth service is running',
      timestamp: new Date().toISOString()
    });
  });

  // Application routes
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/auth', authRoutes);

  // 3) ERROR HANDLING
  // Handle 404 errors
  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  });

  // Global error handler
  app.use(globalErrorHandler);

  return app;
};

// Connect to the in-memory database before tests run
beforeAll(async () => {
  jest.setTimeout(120000); // Increase timeout to 2 minutes
  
  try {
    console.log('Starting MongoDB Memory Server...');
    
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'testdb',
        port: 27017
      }
    });
    
    // Store the MongoDB instance globally for cleanup
    global.__MONGOD__ = mongoServer;
    
    const mongoUri = await mongoServer.getUri();
    const dbName = 'test-db';
    const fullMongoUri = `${mongoUri}${dbName}?retryWrites=true&w=majority`;
    
    console.log(`MongoDB Memory Server started at: ${mongoUri}`);
    console.log(`Connecting to MongoDB at: ${fullMongoUri}`);
    
    try {
      await mongoose.connect(fullMongoUri, {
        serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        // Remove deprecated options for newer MongoDB driver
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false
      });
      
      console.log('MongoDB connected successfully');
      
      // Log the current database name and collections
      const db = mongoose.connection.db;
      console.log('Current database:', db.databaseName);
      
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
    
    // Create and configure the Express app
    console.log('Creating Express app...');
    app = createApp();
    global.app = app;
    
    // Initialize the app (start the server)
    await new Promise((resolve, reject) => {
      global.server = app.listen(TEST_PORT, 'localhost', async () => {
        console.log(`Test server running on port ${TEST_PORT}`);
        
        try {
          // Verify server is responding
          const healthCheck = await request(`http://localhost:${TEST_PORT}`)
            .get('/api/health')
            .timeout(5000);
            
          console.log('Server health check:', {
            status: healthCheck.status,
            body: healthCheck.body,
            headers: healthCheck.headers
          });
          
          if (healthCheck.status !== 200) {
            throw new Error(`Health check failed with status ${healthCheck.status}`);
          }
          
          console.log('Test server is ready');
          resolve();
        } catch (error) {
          console.error('Server health check failed:', error);
          reject(error);
        }
      });
      
      // Handle server errors
      global.server.on('error', (err) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${TEST_PORT} is already in use`);
        }
        reject(err);
      });
    });
    
    console.log('Test setup completed');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
});

// Clear all test data after each test
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
});

// Helper function to close the server
const closeServer = (server) => {
  return new Promise((resolve, reject) => {
    if (!server) return resolve();
    server.close(err => {
      if (err) {
        console.error('Error closing server:', err);
        return reject(err);
      }
      console.log('Test server closed');
      resolve();
    });
  });
};

// Disconnect and close the in-memory database after all tests are done
afterAll(async () => {
  try {
    console.log('Cleaning up test environment...');
    
    // Close the server if it's running
    if (global.server) {
      await closeServer(global.server);
      global.server = null;
    }
    
    // Close the MongoDB connection
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
    
    // Stop the MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB Memory Server stopped');
      mongoServer = null;
    }
    
    // Clear any global variables
    delete global.__MONGOD__;
    delete global.app;
    
    console.log('Test environment cleanup completed');
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
    throw error;
  }
});
