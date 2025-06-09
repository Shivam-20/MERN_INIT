const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const User = require('../../models/userModel');

// Set test timeout to 60 seconds for all tests
jest.setTimeout(60000);

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
  role: 'user',
  active: true
};

describe('Authentication API', () => {
  let authToken;

  beforeAll(async () => {
    console.log('Setting up test data...');
    
    // Get the app instance
    const app = getApp();
    
    // Get the database connection directly from mongoose
    const db = mongoose.connection;
    
    // Ensure we're connected
    if (db.readyState !== 1) {
      await db.asPromise();
    }
    
    console.log('Mongoose connection state:', db.readyState);
    console.log('Mongoose models:', Object.keys(mongoose.models));
    
    // List all collections to ensure we're connected
    const collections = await db.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Clear any existing test data
    await User.deleteMany({});
    
    // Create a test user with hashed password using the User model directly
    const newUser = await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      passwordConfirm: testUser.password,
      role: testUser.role,
      active: true // Ensure the user is active
    });
    
    // Verify the user was created by querying the database directly
    const createdUser = await User.findOne({ email: testUser.email }).lean();
    if (!createdUser) {
      throw new Error('Failed to create test user');
    }
    
    console.log('Test user created:', {
      id: createdUser._id,
      email: createdUser.email,
      password: createdUser.password ? '***' : 'MISSING',
      active: createdUser.active,
      hasPassword: !!createdUser.password
    });
    
    // Log all users in the database for debugging
    const allUsers = await User.find({}).lean();
    console.log('All users in database:', allUsers.map(u => ({
      id: u._id,
      email: u.email,
      hasPassword: !!u.password,
      active: u.active,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    })));
    
    // Store the user ID for later use
    testUser._id = createdUser._id;
    
    // Verify the user can be found with a fresh query
    const freshUser = await User.findById(testUser._id).lean();
    console.log('Fresh user query:', freshUser ? 'Found' : 'Not found');
    
    if (!freshUser) {
      throw new Error('User not found with fresh query');
    }
  });
  
  afterAll(async () => {
    console.log('Cleaning up test data...');
    // Cleanup is handled by the global test setup/teardown
  });
  
  // Helper function to get the app instance from global scope
  const getApp = () => {
    if (!global.app) {
      throw new Error('Test app not initialized');
    }
    return global.app;
  };
  
  test('POST /api/v1/auth/signup should create a new user', async () => {
    const app = getApp();
    
    // Create a unique email for this test
    const testEmail = `test-${Date.now()}@example.com`;
    
    const newUser = {
      name: 'Test User 2',
      email: testEmail,
      password: 'password123',
      passwordConfirm: 'password123',
      role: 'user'
    };
    
    console.log('Creating new test user with email:', testEmail);
    
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(newUser);
      
    console.log('Signup response:', {
      status: res.status,
      body: res.body,
      headers: res.headers
    });
      
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    
    // Verify the user was actually created in the database
    const dbUser = await User.findOne({ email: testEmail });
    expect(dbUser).toBeDefined();
    expect(dbUser.email).toBe(testEmail);
  });
  
  describe('Authentication flow', () => {
    beforeAll(async () => {
      try {
        console.log('Starting login test setup...');
        const app = getApp();
        
        // Verify the user exists in the database
        const users = await User.find({});
        console.log('All users in database before login:', users.map(u => ({
          id: u._id,
          email: u.email,
          active: u.active,
          password: u.password ? '***' : 'MISSING'
        })));
        
        const user = await User.findOne({ email: testUser.email });
        if (!user) {
          throw new Error(`Test user not found in database. Looking for email: ${testUser.email}`);
        }
        
        console.log('Found test user in database:', {
          id: user._id,
          email: user.email,
          active: user.active,
          password: user.password ? '***' : 'MISSING'
        });
        
        // Update the test user with the actual user from the database
        testUser._id = user._id;
        
        // Make login request through the app instance
        console.log('Attempting to login with user:', {
          email: testUser.email,
          password: '********' // Don't log actual password
        });
        
        const res = await request(app)
          .post('/api/v1/auth/login')
          .set('Accept', 'application/json')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .timeout(15000); // 15s timeout for the request
        
        console.log('Login response:', {
          status: res.status,
          body: res.body,
          headers: res.headers
        });
        
        if (res.status === 200 && res.body.token) {
          authToken = res.body.token;
          console.log('Successfully obtained auth token');
        } else {
          throw new Error(`Login failed with status ${res.status}: ${JSON.stringify(res.body)}`);
        }
      } catch (error) {
        console.error('Error in beforeAll:', error);
        throw error; // Re-throw to fail the test
      }
    }, 60000); // 60s timeout for beforeAll
    
    test('POST /api/v1/auth/login should log in a user', () => {
      expect(authToken).toBeDefined();
      expect(typeof authToken).toBe('string');
      expect(authToken.length).toBeGreaterThan(10);
    }, 10000); // 10s timeout for this test
    
    test('GET /api/v1/auth/me should return current user with valid token', async () => {
      expect(authToken).toBeDefined();
      const app = getApp();
      
      console.log('Making authenticated request with token:', authToken ? '***' : 'MISSING');
      
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(10000);
      
      console.log('Current user response:', {
        status: res.status,
        body: res.body,
        headers: res.headers
      });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user._id).toBe(testUser._id.toString());
    }, 15000); // 15s timeout for this test
  });
});
