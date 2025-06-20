import { AppError, globalErrorHandler, catchAsync } from '../../utils/errorHandler.js';

describe('AppError', () => {
  test('should create an error with default values', () => {
    const error = new AppError('Test error');
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.isOperational).toBe(true);
  });

  test('should create an error with custom values', () => {
    const error = new AppError('Custom error', 400, 'fail');
    
    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  test('should create a bad request error', () => {
    const error = AppError.badRequest('Bad request');
    
    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
  });

  test('should create an unauthorized error', () => {
    const error = AppError.unauthorized();
    
    expect(error.message).toBe('You are not authorized to access this resource');
    expect(error.statusCode).toBe(401);
  });

  test('should create a not found error', () => {
    const error = AppError.notFound('User');
    
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
  });

  test('should create a validation error', () => {
    const errors = ['Name is required', 'Email is invalid'];
    const error = AppError.validationError(errors);
    
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(errors);
  });
});

describe('globalErrorHandler', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(() => mockRes),
    };
    mockNext = jest.fn();
  });

  test('should handle operational errors', () => {
    const error = new AppError('Test error', 400, 'fail');
    
    globalErrorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error',
    });
  });

  test('should handle validation errors', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' }
      }
    };
    
    globalErrorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid input data: Name is required. Email is invalid',
      errors: ['Name is required', 'Email is invalid'],
    });
  });

  test('should handle JWT errors', () => {
    const error = { name: 'JsonWebTokenError' };
    
    globalErrorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid token. Please log in again!',
    });
  });

  test('should handle unknown errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Unknown error');
    error.isOperational = false;
    
    globalErrorHandler(error, mockReq, mockRes, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went very wrong!',
    });
    
    process.env.NODE_ENV = originalEnv;
  });
});

describe('catchAsync', () => {
  test('should catch and forward async errors', async () => {
    const mockNext = jest.fn();
    const error = new Error('Async error');
    
    const asyncFn = async () => {
      throw error;
    };
    
    const wrappedFn = catchAsync(asyncFn);
    await wrappedFn({}, {}, mockNext);
    
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  test('should not call next if no error', async () => {
    const mockNext = jest.fn();
    
    const asyncFn = async () => {
      return 'success';
    };
    
    const wrappedFn = catchAsync(asyncFn);
    await wrappedFn({}, {}, mockNext);
    
    expect(mockNext).not.toHaveBeenCalled();
  });
});