import express from 'express';
import passport from 'passport';
import { body, param, validationResult } from 'express-validator';
import User from '../models/User.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      
      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Get users error:', error);
      next(error);
    }
  }
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private/Admin
 */
router.get(
  '/:id',
  [
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const user = await User.findById(req.params.id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }


      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only, cannot delete self or default admin)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  [
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    param('id').isMongoId().withMessage('Invalid user ID'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = req.params.id;
      const requestingUserId = req.user.id;
      const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

      // Prevent deleting self
      if (userId === requestingUserId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent deleting the default admin
      if (user.email === defaultAdminEmail) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete default admin account',
        });
      }

      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      next(error);
    }
  }
);

export default router;
