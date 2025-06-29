import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Schema Validation', () => {
    test('should create a valid user', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.role).toBe(validUser.role);
      expect(savedUser.active).toBe(true);
      expect(savedUser.id).toBeDefined();
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    test('should require name field', async () => {
      const invalidUser = {
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    test('should require email field', async () => {
      const invalidUser = {
        name: 'John Doe',
        password: 'password123'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should require password field', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    test('should validate email format', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should validate email format with valid email', async () => {
      const validUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser.email).toBe(validUser.email);
    });

    test('should enforce unique email constraint', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User(userData);
      let error;

      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should set default role to user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('user');
    });

    test('should accept valid roles', async () => {
      const validRoles = ['user', 'admin'];

      for (const role of validRoles) {
        const userData = {
          name: 'John Doe',
          email: `john-${role}@example.com`,
          password: 'password123',
          role
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser.role).toBe(role);
      }
    });

    test('should reject invalid roles', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    test('should set default active status to true', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.active).toBe(true);
    });

    test('should allow setting active status to false', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        active: false
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.active).toBe(false);
    });

    test('should enforce minimum password length', async () => {
      const invalidUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123' // Too short
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    test('should enforce minimum name length', async () => {
      const invalidUser = {
        name: 'A', // Too short
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    test('should enforce maximum name length', async () => {
      const invalidUser = {
        name: 'A'.repeat(51), // Too long
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(invalidUser);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });
  });

  describe('Pre-save Hook', () => {
    test('should hash password before saving', async () => {
      const hashedPassword = 'hashedPassword123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(savedUser.password).toBe(hashedPassword);
    });

    test('should not hash password if not modified', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      // Clear mock to check if it's called again
      bcrypt.hash.mockClear();

      // Update non-password field
      user.name = 'Jane Doe';
      await user.save();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    test('should hash password when password is modified', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      // Clear mock
      bcrypt.hash.mockClear();
      const newHashedPassword = 'newHashedPassword123';
      bcrypt.hash.mockResolvedValue(newHashedPassword);

      // Update password
      user.password = 'newpassword123';
      await user.save();

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 12);
      expect(user.password).toBe(newHashedPassword);
    });

    test('should handle bcrypt hash errors', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hash error'));

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      let error;

      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Hash error');
    });
  });

  describe('Instance Methods', () => {
    test('should compare password correctly', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };

      const user = new User(userData);
      user.password = 'hashedPassword123';

      // Mock bcrypt.compare to return true for correct password
      bcrypt.compare.mockResolvedValue(true);

      const result = await user.correctPassword('password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };

      const user = new User(userData);
      user.password = 'hashedPassword123';

      // Mock bcrypt.compare to return false for incorrect password
      bcrypt.compare.mockResolvedValue(false);

      const result = await user.correctPassword('wrongpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword123');
      expect(result).toBe(false);
    });

    test('should handle bcrypt compare errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
      };

      const user = new User(userData);
      user.password = 'hashedPassword123';

      bcrypt.compare.mockRejectedValue(new Error('Compare error'));

      let error;
      try {
        await user.correctPassword('password123');
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Compare error');
    });
  });

  describe('Schema Indexes', () => {
    test('should have email index', async () => {
      const indexes = await User.collection.indexes();
      const emailIndex = indexes.find(index => 
        index.key && index.key.email === 1
      );

      expect(emailIndex).toBeDefined();
      expect(emailIndex.unique).toBe(true);
    });

    test('should have active index', async () => {
      const indexes = await User.collection.indexes();
      const activeIndex = indexes.find(index => 
        index.key && index.key.active === 1
      );

      expect(activeIndex).toBeDefined();
    });
  });

  describe('Schema Options', () => {
    test('should exclude password from JSON by default', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.name).toBe(userData.name);
      expect(userJson.email).toBe(userData.email);
    });

    test('should include password when explicitly selected', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const userWithPassword = await User.findById(user._id).select('+password');

      expect(userWithPassword.password).toBeDefined();
    });

    test('should have timestamps', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt instanceof Date).toBe(true);
      expect(savedUser.updatedAt instanceof Date).toBe(true);
    });

    test('should update timestamps on save', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedUser.name = 'Jane Doe';
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Virtual Fields', () => {
    test('should have correctPassword virtual method', () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(typeof user.correctPassword).toBe('function');
    });
  });

  describe('Model Queries', () => {
    test('should find user by email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      const foundUser = await User.findOne({ email: 'john@example.com' });

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('john@example.com');
    });

    test('should find active users only', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        active: true
      };

      const userData2 = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        active: false
      };

      const user1 = new User(userData1);
      const user2 = new User(userData2);
      await user1.save();
      await user2.save();

      const activeUsers = await User.find({ active: true });

      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].email).toBe('john@example.com');
    });

    test('should find users by role', async () => {
      const userData1 = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
      };

      const userData2 = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const user1 = new User(userData1);
      const user2 = new User(userData2);
      await user1.save();
      await user2.save();

      const adminUsers = await User.find({ role: 'admin' });

      expect(adminUsers).toHaveLength(1);
      expect(adminUsers[0].email).toBe('admin@example.com');
    });
  });
}); 