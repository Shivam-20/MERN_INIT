import { AppError } from '../utils/errorHandler.js';

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // If not admin, return 403 Forbidden
  return next(
    new AppError('You do not have permission to perform this action', 403)
  );
};

/**
 * Middleware to check if user is authenticated
 * This works with the JWT strategy which attaches the user to req.user
 */
export const isAuthenticated = (req, res, next) => {
  // Check if user is authenticated via JWT
  if (req.user) {
    return next();
  }
  
  return next(new AppError('Please log in to access this resource', 401));
};
