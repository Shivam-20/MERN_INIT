/**
 * Base error class that extends the built-in Error class
 */
class BaseError extends Error {
  constructor(message, statusCode, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', errors = null) {
    super(message, 400, true);
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends BaseError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends BaseError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity Error
 */
class ValidationError extends BaseError {
  constructor(message = 'Validation Error', errors = null) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 429 Too Many Requests Error
 */
class RateLimitError extends BaseError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends BaseError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false);
  }
}

module.exports = {
  BaseError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
};
