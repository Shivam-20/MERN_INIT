const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/userModel');

// Increase the test timeout to 5 minutes for all tests
jest.setTimeout(300000);

// Helper function to wait for the server to be ready
const waitForServer = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

// Test user data
const testUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
  role: 'user',
  active: true
};

let testUser;
let authToken;

// Setup and teardown
beforeAll(async () => {
  try {
    console.log('Setting up test environment...');
    
    // Wait for server to be ready
    console.log('Waiting for server to be ready...');
    await waitForServer(5000);
    
    // Clear any existing test data
    console.log('Clearing test data...');
    await User.deleteMany({}).exec();
    
    console.log('Creating test user...');
    // Create a test user with hashed password
    testUser = new User({
      name: testUserData.name,
      email: testUserData.email,
      password: testUserData.password,
      passwordConfirm: testUserData.passwordConfirm,
      role: testUserData.role,
      active: testUserData.active
    });
    
    // Save the user to trigger the password hashing middleware
    await testUser.save();
    console.log('Test user created:', testUser._id);
    
    // Log in the test user to get a token
    console.log('Logging in test user...');
    const res = await request(global.app)
      .post('/api/v1/auth/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      });
    
    console.log('Login response status:', res.status);
    
    if (res.status >= 400) {
      console.error('Login failed:', res.body);
      throw new Error('Login failed in test setup');
    }
    
    // Store the token from the response
    if (res.body.token) {
      authToken = `Bearer ${res.body.token}`;
      console.log('Got token from response body');
    } else if (res.headers['set-cookie']) {
      // Extract token from cookie if using cookie-based auth
      const cookies = res.headers['set-cookie'][0].split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
      if (tokenCookie) {
        authToken = `Bearer ${tokenCookie.split('=')[1]}`;
        console.log('Got token from cookie');
      }
    }
    
    if (!authToken) {
      throw new Error('Failed to get authentication token');
    }
    
    console.log('Test setup completed');
  } catch (error) {
    console.error('Error in beforeAll:', error);
    throw error;
  }
});

afterEach(async () => {
  try {
    // Clean up test data after each test
    await User.deleteMany({ email: { $ne: testUserData.email } });
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
});

afterAll(async () => {
  try {
    console.log('Cleaning up test environment...');
    
    // Clean up the test database
    await User.deleteMany({}).exec();
    console.log('Test data cleaned up');
    
    // Close the database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    
    // Stop the MongoDB memory server if it's running
    if (global.__MONGOD__) {
      await global.__MONGOD__.stop();
      console.log('MongoDB memory server stopped');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

describe('Authentication API', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        passwordConfirm: 'password123'
      };
      
      const res = await request(global.app)
        .post('/api/v1/auth/signup')
        .send(newUser);
        
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(newUser.email);
      expect(res.body.token).toBeDefined();
    });
    
    it('should return 400 if required fields are missing', async () => {
      const res = await request(global.app)
        .post('/api/v1/auth/signup')
        .send({ name: 'Incomplete User' });
        
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('should log in a user with correct credentials', async () => {
      const res = await request(global.app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password
        });
        
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
    });
    
    it('should return 401 with incorrect password', async () => {
      const res = await request(global.app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: 'wrongpassword'
        });
        
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
  
  describe('GET /api/v1/auth/me', () => {
    it('should get the current user with valid token', async () => {
      const res = await request(global.app)
        .get('/api/v1/auth/me')
        .set('Authorization', authToken);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(testUserData.email);
    });
    
    it('should return 401 without a token', async () => {
      const res = await request(global.app)
        .get('/api/v1/auth/me');
        
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('You are not logged in');
    });
    
    it('should return 401 with invalid token', async () => {
      const res = await request(global.app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
        
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('Invalid token');
    });
  });
});
