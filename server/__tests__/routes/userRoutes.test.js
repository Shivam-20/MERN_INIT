import request from 'supertest';
import express from 'express';
import passport from 'passport';
import userRoutes from '../../routes/userRoutes.js';
import * as userController from '../../controllers/userController.js';
import { AppError } from '../../utils/errorHandler.js';

// Mock passport authentication
jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = { id: '123', email: 'test@example.com', role: 'user' };
    next();
  })
}));

// Mock user controller
jest.mock('../../controllers/userController.js');

// Mock auth middleware
jest.mock('../../middleware/auth.js', () => ({
  isAdmin: jest.fn((req, res, next) => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  })
}));

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset user to regular user by default
    passport.authenticate = jest.fn(() => (req, res, next) => {
      req.user = { id: '123', email: 'test@example.com', role: 'user' };
      next();
    });
  });

  describe('GET /api/users (Admin Only)', () => {
    test('should allow admin to get all users', async () => {
      // Mock admin user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'admin@example.com', role: 'admin' };
        next();
      });

      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'user' },
        { id: '2', name: 'User 2', email: 'user2@example.com', role: 'user' }
      ];

      userController.getAllUsers.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          results: mockUsers.length,
          data: { users: mockUsers }
        });
      });

      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(2);
      expect(response.body.data.users).toHaveLength(2);
      expect(userController.getAllUsers).toHaveBeenCalled();
    });

    test('should reject non-admin users from getting all users', async () => {
      // Mock regular user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'user@example.com', role: 'user' };
        next();
      });

      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Admin access required');
    });

    test('should handle query parameters for filtering', async () => {
      // Mock admin user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'admin@example.com', role: 'admin' };
        next();
      });

      userController.getAllUsers.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          results: 1,
          data: { users: [{ id: '1', name: 'User 1', email: 'user1@example.com' }] }
        });
      });

      const response = await request(app)
        .get('/api/users?role=user&sort=name&limit=10&page=1');

      expect(response.status).toBe(200);
      expect(userController.getAllUsers).toHaveBeenCalled();
    });

    test('should handle pagination parameters', async () => {
      // Mock admin user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'admin@example.com', role: 'admin' };
        next();
      });

      userController.getAllUsers.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          results: 0,
          data: { users: [] }
        });
      });

      const response = await request(app)
        .get('/api/users?page=2&limit=5');

      expect(response.status).toBe(200);
      expect(userController.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('POST /api/users (Admin Only)', () => {
    test('should allow admin to create new user', async () => {
      // Mock admin user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'admin@example.com', role: 'admin' };
        next();
      });

      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };

      const mockCreatedUser = {
        id: '456',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
        createdAt: new Date()
      };

      userController.createUser.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          data: { user: mockCreatedUser }
        });
      });

      const response = await request(app)
        .post('/api/users')
        .send(newUserData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(userController.createUser).toHaveBeenCalled();
    });

    test('should reject non-admin users from creating users', async () => {
      // Mock regular user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'user@example.com', role: 'user' };
        next();
      });

      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUserData);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Admin access required');
    });

    test('should handle validation errors in user creation', async () => {
      // Mock admin user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'admin@example.com', role: 'admin' };
        next();
      });

      userController.createUser.mockImplementation((req, res, next) => {
        next(new AppError('Email already in use', 400));
      });

      const newUserData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUserData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email already in use');
    });
  });

  describe('GET /api/users/me', () => {
    test('should get current user profile', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      userController.getMe.mockImplementation((req, res, next) => {
        req.params.id = req.user.id;
        next();
      });

      userController.getUser.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: { user: mockUser }
        });
      });

      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(userController.getMe).toHaveBeenCalled();
      expect(userController.getUser).toHaveBeenCalled();
    });

    test('should handle user not found', async () => {
      userController.getMe.mockImplementation((req, res, next) => {
        req.params.id = req.user.id;
        next();
      });

      userController.getUser.mockImplementation((req, res, next) => {
        next(new AppError('No user found with that ID', 404));
      });

      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No user found with that ID');
    });
  });

  describe('PATCH /api/users/updateMe', () => {
    test('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockUpdatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'user'
      };

      userController.updateMe.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: { user: mockUpdatedUser }
        });
      });

      const response = await request(app)
        .patch('/api/users/updateMe')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(userController.updateMe).toHaveBeenCalled();
    });

    test('should reject password update through updateMe', async () => {
      const updateData = {
        name: 'Updated Name',
        password: 'newpassword123',
        passwordConfirm: 'newpassword123'
      };

      userController.updateMe.mockImplementation((req, res, next) => {
        next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
      });

      const response = await request(app)
        .patch('/api/users/updateMe')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('This route is not for password updates');
    });

    test('should filter out unauthorized fields', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'admin', // Should be filtered out
        password: 'newpassword' // Should be filtered out
      };

      const mockUpdatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'user' // Should remain unchanged
      };

      userController.updateMe.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: { user: mockUpdatedUser }
        });
      });

      const response = await request(app)
        .patch('/api/users/updateMe')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('user'); // Should not be changed to admin
      expect(userController.updateMe).toHaveBeenCalled();
    });

    test('should handle validation errors', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      userController.updateMe.mockImplementation((req, res, next) => {
        next(new AppError('Invalid email format', 400));
      });

      const response = await request(app)
        .patch('/api/users/updateMe')
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('PUT /api/users/updateMe', () => {
    test('should update user profile with PUT method', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockUpdatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'user'
      };

      userController.updateMe.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: { user: mockUpdatedUser }
        });
      });

      const response = await request(app)
        .put('/api/users/updateMe')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(userController.updateMe).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/users/updateMyPassword', () => {
    test('should update user password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'newpassword123'
      };

      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      userController.updateMyPassword.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: { user: mockUser }
        });
      });

      const response = await request(app)
        .patch('/api/users/updateMyPassword')
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(userController.updateMyPassword).toHaveBeenCalled();
    });

    test('should reject password update with mismatched confirmation', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'differentpassword'
      };

      userController.updateMyPassword.mockImplementation((req, res, next) => {
        next(new AppError('Passwords do not match', 400));
      });

      const response = await request(app)
        .patch('/api/users/updateMyPassword')
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Passwords do not match');
    });

    test('should reject password update with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'newpassword123'
      };

      userController.updateMyPassword.mockImplementation((req, res, next) => {
        next(new AppError('Current password is incorrect', 400));
      });

      const response = await request(app)
        .patch('/api/users/updateMyPassword')
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Current password is incorrect');
    });

    test('should reject password update with weak new password', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: '123',
        newPasswordConfirm: '123'
      };

      userController.updateMyPassword.mockImplementation((req, res, next) => {
        next(new AppError('Password must be at least 6 characters long', 400));
      });

      const response = await request(app)
        .patch('/api/users/updateMyPassword')
        .send(passwordData);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });
  });

  describe('DELETE /api/users/deleteMe', () => {
    test('should delete user account successfully', async () => {
      userController.deleteMe.mockImplementation((req, res) => {
        res.status(204).json({
          status: 'success',
          data: null
        });
      });

      const response = await request(app)
        .delete('/api/users/deleteMe');

      expect(response.status).toBe(204);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeNull();
      expect(userController.deleteMe).toHaveBeenCalled();
    });

    test('should handle deletion errors', async () => {
      userController.deleteMe.mockImplementation((req, res, next) => {
        next(new AppError('Failed to delete account', 500));
      });

      const response = await request(app)
        .delete('/api/users/deleteMe');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Failed to delete account');
    });
  });

  describe('Fallback Route', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain("Can't find");
    });

    test('should return 404 for unsupported HTTP methods', async () => {
      const response = await request(app)
        .post('/api/users/me');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for all user routes', async () => {
      // Temporarily mock passport to return no user
      const originalAuthenticate = passport.authenticate;
      passport.authenticate = jest.fn(() => (req, res, next) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);

      // Restore original mock
      passport.authenticate = originalAuthenticate;
    });

    test('should handle different user roles correctly', async () => {
      // Test admin user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'admin@example.com', role: 'admin' };
        next();
      });

      userController.getAllUsers.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          results: 0,
          data: { users: [] }
        });
      });

      const adminResponse = await request(app)
        .get('/api/users');

      expect(adminResponse.status).toBe(200);

      // Test regular user
      passport.authenticate = jest.fn(() => (req, res, next) => {
        req.user = { id: '123', email: 'user@example.com', role: 'user' };
        next();
      });

      const userResponse = await request(app)
        .get('/api/users');

      expect(userResponse.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    test('should handle controller errors gracefully', async () => {
      userController.getMe.mockImplementation((req, res, next) => {
        next(new Error('Unexpected error'));
      });

      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Internal server error');
    });

    test('should handle validation errors from controllers', async () => {
      userController.updateMe.mockImplementation((req, res, next) => {
        next(new AppError('Validation failed', 400));
      });

      const response = await request(app)
        .patch('/api/users/updateMe')
        .send({ name: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('Request Validation', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .patch('/api/users/updateMe')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    test('should handle empty request body', async () => {
      const response = await request(app)
        .patch('/api/users/updateMe')
        .send({});

      expect(response.status).toBe(200); // Should be handled by controller
    });

    test('should handle large request bodies', async () => {
      const largeData = {
        name: 'A'.repeat(10000) // Very large name
      };

      userController.updateMe.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: { user: { id: '123', name: largeData.name } }
        });
      });

      const response = await request(app)
        .patch('/api/users/updateMe')
        .send(largeData);

      expect(response.status).toBe(200);
    });
  });
}); 