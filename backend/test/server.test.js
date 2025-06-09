const request = require('supertest');
const mongoose = require('mongoose');

// Set test timeout to 30 seconds
jest.setTimeout(30000);

describe('Server Status', () => {
  test('GET /api/health should return 200', async () => {
    // Use the global app instance if available, otherwise use the test URL
    const app = global.app || 'http://localhost:3001';
    console.log('Testing server at:', typeof app === 'function' ? 'app instance' : app);
    
    const res = await request(app)
      .get('/api/health')
      .timeout(5000);
    
    console.log('Health check response:', {
      status: res.status,
      body: res.body,
      headers: res.headers
    });
    
    expect(res.status).toBe(200);
  });
  
  test('GET /api/v1/auth/status should return 200', async () => {
    const app = global.app || 'http://localhost:3001';
    console.log('Testing auth status at:', typeof app === 'function' ? 'app instance' : app);
    
    const res = await request(app)
      .get('/api/v1/auth/status')
      .timeout(5000);
    
    console.log('Auth status response:', {
      status: res.status,
      body: res.body,
      headers: res.headers
    });
    
    expect(res.status).toBe(200);
  });
});
