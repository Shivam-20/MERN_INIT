import User from '../../models/User.js';
import { AppError } from '../../utils/errorHandler.js';
import * as userController from '../../controllers/userController.js';

// Mock User model
jest.mock('../../models/User.js');

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token')
}));

describe('User Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: '123', email: 'test@example.com', role: 'user' }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('createUser', () => {
    test('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      };

      mockReq.body = userData;

      const mockUser = {
        id: '456',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(User).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          user: {
            id: '456',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            createdAt: mockUser.createdAt
          }
        }
      });
    });

    test('should reject creation with existing email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      mockReq.body = userData;

      User.findOne = jest.fn().mockResolvedValue({ email: 'existing@example.com' });

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('Email already in use');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    test('should handle database errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      mockReq.body = userData;

      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should use default role when not provided', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      mockReq.body = userData;

      const mockUser = {
        id: '456',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(User).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      });
    });

    test('should convert role to lowercase', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'ADMIN'
      };

      mockReq.body = userData;

      const mockUser = {
        id: '456',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      await userController.createUser(mockReq, mockRes, mockNext);

      expect(User).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin'
      });
    });
  });

  describe('getAllUsers', () => {
    test('should get all users with default pagination', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' }
      ];

      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockUsers)
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(2);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(User.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { users: mockUsers }
      });
    });

    test('should handle query filtering', async () => {
      mockReq.query = { role: 'user', active: 'true' };

      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(0);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(User.find).toHaveBeenCalledWith({ role: 'user', active: 'true' });
    });

    test('should handle advanced filtering with operators', async () => {
      mockReq.query = { createdAt: { gte: '2023-01-01' } };

      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(0);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(User.find).toHaveBeenCalledWith({ createdAt: { $gte: '2023-01-01' } });
    });

    test('should handle sorting', async () => {
      mockReq.query = { sort: 'name,-createdAt' };

      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(0);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(User.find().sort).toHaveBeenCalledWith('name -createdAt');
    });

    test('should handle field limiting', async () => {
      mockReq.query = { fields: 'name,email' };

      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(0);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(User.find().sort().select).toHaveBeenCalledWith('name email');
    });

    test('should handle pagination', async () => {
      mockReq.query = { page: '2', limit: '5' };

      User.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      });

      User.countDocuments = jest.fn().mockResolvedValue(10);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(User.find().sort().select().skip).toHaveBeenCalledWith(5);
      expect(User.find().sort().select().skip().limit).toHaveBeenCalledWith(5);
    });

    test('should handle pagination beyond available data', async () => {
      mockReq.query = { page: '100' };

      User.countDocuments = jest.fn().mockResolvedValue(10);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockNext.mock.calls[0][0].message).toBe('This page does not exist');
    });

    test('should handle database errors', async () => {
      User.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getUser', () => {
    test('should get user by ID successfully', async () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      };

      mockReq.params.id = '123';

      User.findById = jest.fn().mockResolvedValue(mockUser);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser }
      });
    });

    test('should handle user not found', async () => {
      mockReq.params.id = 'nonexistent';

      User.findById = jest.fn().mockResolvedValue(null);

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(User.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('No user found with that ID');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
    });

    test('should handle database errors', async () => {
      mockReq.params.id = '123';

      User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.getUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMe', () => {
    test('should set user ID from authenticated user', () => {
      mockReq.user = { id: '123' };

      userController.getMe(mockReq, mockRes, mockNext);

      expect(mockReq.params.id).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('updateMe', () => {
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

      mockReq.body = updateData;
      mockReq.user = { id: '123' };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

      await userController.updateMe(mockReq, mockRes, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        updateData,
        {
          new: true,
          runValidators: true
        }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUpdatedUser }
      });
    });

    test('should reject password update through updateMe', async () => {
      const updateData = {
        name: 'Updated Name',
        password: 'newpassword123',
        passwordConfirm: 'newpassword123'
      };

      mockReq.body = updateData;

      await userController.updateMe(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toContain('This route is not for password updates');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    test('should filter out unauthorized fields', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'admin', // Should be filtered out
        password: 'newpassword' // Should be filtered out
      };

      const expectedFilteredData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const mockUpdatedUser = {
        id: '123',
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'user'
      };

      mockReq.body = updateData;
      mockReq.user = { id: '123' };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

      await userController.updateMe(mockReq, mockRes, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        expectedFilteredData,
        {
          new: true,
          runValidators: true
        }
      );
    });

    test('should handle database errors', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      mockReq.body = updateData;
      mockReq.user = { id: '123' };

      User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.updateMe(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should handle validation errors', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      mockReq.body = updateData;
      mockReq.user = { id: '123' };

      User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Validation failed'));

      await userController.updateMe(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteMe', () => {
    test('should delete user account successfully', async () => {
      mockReq.user = { id: '123' };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue({ active: false });

      await userController.deleteMe(mockReq, mockRes, mockNext);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', { active: false });
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: null
      });
    });

    test('should handle database errors', async () => {
      mockReq.user = { id: '123' };

      User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.deleteMe(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateMyPassword', () => {
    test('should update password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'newpassword123'
      };

      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        password: 'hashedOldPassword',
        correctPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      mockReq.body = passwordData;
      mockReq.user = { id: '123' };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await userController.updateMyPassword(mockReq, mockRes, mockNext);

      expect(User.findById).toHaveBeenCalledWith('123');
      expect(User.findById().select).toHaveBeenCalledWith('+password');
      expect(mockUser.correctPassword).toHaveBeenCalledWith('oldpassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser }
      });
    });

    test('should reject password update with wrong current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'newpassword123'
      };

      const mockUser = {
        id: '123',
        correctPassword: jest.fn().mockResolvedValue(false)
      };

      mockReq.body = passwordData;
      mockReq.user = { id: '123' };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await userController.updateMyPassword(mockReq, mockRes, mockNext);

      expect(mockUser.correctPassword).toHaveBeenCalledWith('wrongpassword');
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('Your current password is wrong');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    test('should reject password update with mismatched confirmation', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'differentpassword'
      };

      mockReq.body = passwordData;

      await userController.updateMyPassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('Passwords are not the same');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    });

    test('should handle user not found', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'newpassword123'
      };

      mockReq.body = passwordData;
      mockReq.user = { id: '123' };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await userController.updateMyPassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      expect(mockNext.mock.calls[0][0].message).toBe('There is no user with email address');
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    test('should handle database errors', async () => {
      const passwordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        newPasswordConfirm: 'newpassword123'
      };

      mockReq.body = passwordData;
      mockReq.user = { id: '123' };

      User.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await userController.updateMyPassword(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
}); 