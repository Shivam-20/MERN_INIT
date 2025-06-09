const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const AppError = require('../utils/appError');

/**
 * Rate limiter middleware to limit repeated requests
 * @param {Object} options - Rate limiting options
 * @returns {Function} Rate limiting middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    ...options,
  };

  const limiter = rateLimit({
    ...defaultOptions,
    handler: (req, res, next) => {
      next(
        new AppError(
          `Too many requests from this IP, please try again in ${Math.ceil(
            defaultOptions.windowMs / 60000
          )} minutes`,
          429
        )
      );
    },
  });

  return limiter;
};

// Apply rate limiting to all requests
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Apply stronger rate limiting to auth routes
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many login attempts, please try again later',
});

// Apply even stronger rate limiting to password reset
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: 'Too many password reset attempts, please try again later',
});

module.exports = {
  createRateLimiter,
  globalRateLimiter,
  authRateLimiter,
  passwordResetLimiter,
};
