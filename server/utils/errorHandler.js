/**
 * Custom Error class for handling operational errors
 * @extends Error
 */
class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} status - Status type ('fail' or 'error')
   */
  constructor(message, statusCode, status) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = status || 'error';
    this.isOperational = true;
    
    // Capture the stack trace, excluding the constructor call from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a bad request error (400)
   * @param {string} message - Error message
   * @returns {AppError} Bad request error
   */
  static badRequest(message) {
    return new AppError(message, 400, 'fail');
  }

  /**
   * Create an unauthorized error (401)
   * @param {string} message - Error message
   * @returns {AppError} Unauthorized error
   */
  static unauthorized(message = 'You are not authorized to access this resource') {
    return new AppError(message, 401, 'fail');
  }

  /**
   * Create a forbidden error (403)
   * @param {string} message - Error message
   * @returns {AppError} Forbidden error
   */
  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(message, 403, 'fail');
  }

  /**
   * Create a not found error (404)
   * @param {string} resource - Name of the resource that was not found
   * @returns {AppError} Not found error
   */
  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, 'fail');
  }

  /**
   * Create a validation error (422)
   * @param {Array} errors - Array of validation errors
   * @returns {AppError} Validation error
   */
  static validationError(errors) {
    const error = new AppError('Validation failed', 422, 'fail');
    error.errors = errors;
    return error;
  }

  /**
   * Create a duplicate field error (409)
   * @param {string} field - Name of the duplicate field
   * @returns {AppError} Duplicate field error
   */
  static duplicateField(field) {
    return new AppError(
      `The ${field} is already in use. Please use a different ${field}`,
      409,
      'fail'
    );
  }
}

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default values if not provided
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥', {
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return res.status(400).json({
      status: 'fail',
      message,
      errors,
    });
  }

  if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID format)
    const message = `Invalid ${err.path}: ${err.value}`;
    return res.status(400).json({
      status: 'fail',
      message,
    });
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const value = err.errmsg.match(/([\"\'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return res.status(400).json({
      status: 'fail',
      message,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again!',
    });
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired error
    return res.status(401).json({
      status: 'fail',
      message: 'Your token has expired! Please log in again.',
    });
  }

  // For operational errors that we trust: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }), // Include validation errors if they exist
    });
  }

  // For programming or other unknown errors: don't leak error details to the client
  console.error('ERROR 💥', err);
  
  // Send generic message in production, full error in development
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went very wrong!',
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack,
    }),
  });
};

/**
 * Catch async/await errors in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler with error handling
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export { AppError, globalErrorHandler, catchAsync };
