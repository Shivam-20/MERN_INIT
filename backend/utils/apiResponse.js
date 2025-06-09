/**
 * Sends a success response with data
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in the response
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Error} error - Optional error object (for development)
 */
const sendError = (res, message, statusCode = 500, error = null) => {
  const response = {
    status: 'error',
    message
  };

  // Include error stack in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error;
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Sends a validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 * @param {string} message - Optional custom error message
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
  res.status(400).json({
    status: 'fail',
    message,
    errors
  });
};

/**
 * Sends a 404 not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
const sendNotFound = (res, resource = 'Resource') => {
  res.status(404).json({
    status: 'fail',
    message: `${resource} not found`
  });
};

/**
 * Sends a 403 forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Optional custom message
 */
const sendForbidden = (res, message = 'You do not have permission to perform this action') => {
  res.status(403).json({
    status: 'fail',
    message
  });
};

/**
 * Sends a 401 unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Optional custom message
 */
const sendUnauthorized = (res, message = 'Please log in to access this resource') => {
  res.status(401).json({
    status: 'fail',
    message
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendUnauthorized
};
