const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Admin login route
router.post('/admin/login', authController.adminLogin);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after this middleware (authentication required)
router.use(authController.protect);

// Protected routes (authentication required)
router.patch('/update-my-password', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Admin only routes
router.use(authController.restrictTo('admin'));

// Admin user management routes can be added here if needed

module.exports = router;
