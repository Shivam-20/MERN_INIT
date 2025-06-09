const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @route   GET /api/v1/test/email/welcome
 * @desc    Test welcome email template
 * @access  Public
 */
router.get('/email/welcome', async (req, res, next) => {
  try {
    await emailService.sendWelcomeEmail(
      'test@example.com',
      'Test User',
      'test-verification-token-123'
    );
    sendSuccess(res, { message: 'Welcome email sent successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/test/email/password-reset
 * @desc    Test password reset email template
 * @access  Public
 */
router.get('/email/password-reset', async (req, res, next) => {
  try {
    await emailService.sendPasswordResetEmail(
      'test@example.com',
      'Test User',
      'test-reset-token-456'
    );
    sendSuccess(res, { message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
