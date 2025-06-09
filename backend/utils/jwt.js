const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AppError = require('./appError');

/**
 * Sign JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {AppError} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again!', 401);
    }
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired! Please log in again.', 401);
    }
    throw err;
  }
};

/**
 * Create and send JWT token
 * @param {Object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  
  // Remove password from output
  user.password = undefined;

  // Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  };

  // Set cookie
  res.cookie('jwt', token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports = {
  signToken,
  verifyToken,
  createSendToken,
};
