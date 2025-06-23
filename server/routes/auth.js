import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';

// Validation functions
const validateRegisterInput = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password || data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateLoginInput = (data) => {
  const errors = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { name, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Create new user - the pre-save hook will handle password hashing
    const newUser = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role: role.toLowerCase(),
    });

    await newUser.save();

    // Create JWT payload
    const payload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { email, password, isAdmin = false } = req.body;

    // Find user by email and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is admin if admin login is requested
    if (isAdmin && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    // Check password using the instance method
    const isMatch = await user.correctPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
});

/**
 * @route   GET /api/auth/admin/login
 * @desc    Login admin with predefined credentials
 * @access  Public
 */
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    // Check if it's the default admin
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    // For demo purposes, we're using a simple password check
    // In production, you should use hashed passwords
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    // Find or create admin user
    let admin = await User.findOne({ email });

    if (!admin) {
      admin = new User({
        name: 'Admin',
        email,
        password,
        role: 'admin',
      });
      await admin.save();
    }

    const payload = {
      user: {
        id: admin.id,
        role: admin.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// @route   POST /api/v1/auth/forgot-password
// @desc    Forgot password - Send reset email (placeholder)
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address',
      });
    }

    // In a real app, you would:
    // 1. Generate a reset token
    // 2. Save it to the user (with expiration)
    // 3. Send an email with the reset link
    
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Password reset email sent (placeholder implementation)',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/auth/reset-password/:token
// @desc    Reset password with token (placeholder)
// @access  Public
router.patch('/reset-password/:token', async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // In a real app, you would:
    // 1. Verify the reset token
    // 2. Find the user by token
    // 3. Update the password
    // 4. Clear the reset token
    
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Password reset successful (placeholder implementation)',
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/v1/auth/update-password
// @desc    Update current user password
// @access  Private
router.patch('/update-password', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { currentPassword, password, passwordConfirm } = req.body;

    if (!currentPassword || !password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password, new password, and password confirmation',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match',
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.correctPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = password;
    await user.save();

    // Create new JWT
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
