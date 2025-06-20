/**
 * API Response Utility
 * Provides consistent response formatting for the API
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    status: 'success',
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Array} errors - Array of detailed errors
 */
export const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };

  // Don't send detailed errors in production for security
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    response.message = 'Internal server error';
    delete response.errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @param {string} message - Main error message
 */
export const sendValidationError = (res, errors, message = 'Validation failed') => {
  const response = {
    success: false,
    status: 'fail',
    message,
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString(),
  };

  return res.status(422).json(response);
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendUnauthorized = (res, message = 'You are not authorized to access this resource') => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const sendForbidden = (res, message = 'You do not have permission to perform this action') => {
  return sendError(res, message, 403);
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @param {string} message - Success message
 */
export const sendPaginatedResponse = (res, data, page, limit, totalItems, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = parseInt(page);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const response = {
    success: true,
    status: 'success',
    message,
    data,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPrevPage ? currentPage - 1 : null,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(response);
};

/**
 * Send response with token
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 * @param {string} token - JWT token
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendTokenResponse = (res, user, token, message = 'Authentication successful', statusCode = 200) => {
  const response = {
    success: true,
    status: 'success',
    message,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Create standardized API response object
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {Array} errors - Array of errors
 * @returns {Object} Standardized response object
 */
export const createResponse = (success, message, data = null, errors = null) => {
  return {
    success,
    status: success ? 'success' : 'fail',
    message,
    ...(data && { data }),
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Middleware to catch async errors and format them
 * @param {Function} asyncFn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (asyncFn) => (req, res, next) => {
  Promise.resolve(asyncFn(req, res, next)).catch((error) => {
    console.error('Async error:', error);
    
    // Send formatted error response
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendValidationError(res, errors);
    }
    
    if (error.name === 'CastError') {
      return sendError(res, `Invalid ${error.path}: ${error.value}`, 400);
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return sendError(res, `${field} already exists`, 409);
    }
    
    // Pass to global error handler
    next(error);
  });
}; 