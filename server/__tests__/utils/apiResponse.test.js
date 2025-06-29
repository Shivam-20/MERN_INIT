import { successResponse, errorResponse, paginatedResponse } from '../../utils/apiResponse.js';

describe('API Response Utils', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('successResponse', () => {
    test('should send success response with data', () => {
      const data = { user: { id: '123', name: 'John Doe' } };
      const message = 'User created successfully';

      successResponse(mockRes, 201, data, message);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: { user: { id: '123', name: 'John Doe' } }
      });
    });

    test('should send success response without message', () => {
      const data = { user: { id: '123', name: 'John Doe' } };

      successResponse(mockRes, 200, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user: { id: '123', name: 'John Doe' } }
      });
    });

    test('should send success response without data', () => {
      const message = 'Operation completed successfully';

      successResponse(mockRes, 200, null, message);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation completed successfully'
      });
    });

    test('should send success response with only status code', () => {
      successResponse(mockRes, 204);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true
      });
    });

    test('should handle different status codes', () => {
      const statusCodes = [200, 201, 204, 202];

      statusCodes.forEach(statusCode => {
        mockRes.status.mockClear();
        mockRes.json.mockClear();

        successResponse(mockRes, statusCode);

        expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      });
    });

    test('should handle complex data structures', () => {
      const complexData = {
        users: [
          { id: '1', name: 'User 1', email: 'user1@example.com' },
          { id: '2', name: 'User 2', email: 'user2@example.com' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2
        }
      };

      successResponse(mockRes, 200, complexData, 'Users retrieved successfully');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: complexData
      });
    });

    test('should handle empty arrays', () => {
      const emptyArray = [];

      successResponse(mockRes, 200, emptyArray, 'No users found');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'No users found',
        data: []
      });
    });

    test('should handle null data', () => {
      successResponse(mockRes, 204, null, 'Resource deleted');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Resource deleted',
        data: null
      });
    });
  });

  describe('errorResponse', () => {
    test('should send error response with message', () => {
      const message = 'User not found';
      const statusCode = 404;

      errorResponse(mockRes, statusCode, message);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    test('should send error response with errors object', () => {
      const message = 'Validation failed';
      const statusCode = 400;
      const errors = {
        email: 'Email is required',
        password: 'Password must be at least 6 characters'
      };

      errorResponse(mockRes, statusCode, message, errors);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: {
          email: 'Email is required',
          password: 'Password must be at least 6 characters'
        }
      });
    });

    test('should send error response without errors', () => {
      const message = 'Internal server error';
      const statusCode = 500;

      errorResponse(mockRes, statusCode, message);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
    });

    test('should handle different error status codes', () => {
      const errorCodes = [400, 401, 403, 404, 422, 500];

      errorCodes.forEach(statusCode => {
        mockRes.status.mockClear();
        mockRes.json.mockClear();

        errorResponse(mockRes, statusCode, 'Error message');

        expect(mockRes.status).toHaveBeenCalledWith(statusCode);
      });
    });

    test('should handle complex error objects', () => {
      const complexErrors = {
        validation: {
          email: ['Email is required', 'Email format is invalid'],
          password: ['Password is required']
        },
        database: {
          constraint: 'Unique constraint violation'
        }
      };

      errorResponse(mockRes, 422, 'Multiple validation errors', complexErrors);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Multiple validation errors',
        errors: complexErrors
      });
    });

    test('should handle empty error message', () => {
      errorResponse(mockRes, 500, '');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: ''
      });
    });

    test('should handle null error message', () => {
      errorResponse(mockRes, 500, null);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: null
      });
    });
  });

  describe('paginatedResponse', () => {
    test('should send paginated response with data', () => {
      const data = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      const pagination = {
        page: 1,
        limit: 10,
        total: 25,
        pages: 3
      };

      paginatedResponse(mockRes, 200, data, pagination, 'Users retrieved successfully');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3
        }
      });
    });

    test('should send paginated response without message', () => {
      const data = [{ id: '1', name: 'User 1' }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      };

      paginatedResponse(mockRes, 200, data, pagination);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        pagination: pagination
      });
    });

    test('should handle empty data array', () => {
      const data = [];
      const pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      };

      paginatedResponse(mockRes, 200, data, pagination, 'No users found');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'No users found',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      });
    });

    test('should handle large datasets', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i.toString(), name: `User ${i}` }));
      const pagination = {
        page: 5,
        limit: 20,
        total: 1000,
        pages: 50
      };

      paginatedResponse(mockRes, 200, data, pagination, 'Users retrieved successfully');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: data,
        pagination: pagination
      });
    });

    test('should handle single page results', () => {
      const data = [{ id: '1', name: 'User 1' }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1
      };

      paginatedResponse(mockRes, 200, data, pagination);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1
        }
      });
    });

    test('should handle last page results', () => {
      const data = [{ id: '25', name: 'User 25' }];
      const pagination = {
        page: 3,
        limit: 10,
        total: 25,
        pages: 3
      };

      paginatedResponse(mockRes, 200, data, pagination, 'Last page of users');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Last page of users',
        data: data,
        pagination: {
          page: 3,
          limit: 10,
          total: 25,
          pages: 3
        }
      });
    });
  });

  describe('Response Chainability', () => {
    test('should allow chaining of response methods', () => {
      const data = { user: { id: '123' } };

      successResponse(mockRes, 200, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('should maintain response object state', () => {
      const data1 = { user: { id: '123' } };
      const data2 = { user: { id: '456' } };

      successResponse(mockRes, 200, data1);
      successResponse(mockRes, 201, data2);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined data', () => {
      successResponse(mockRes, 200, undefined, 'Success');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: undefined
      });
    });

    test('should handle undefined message', () => {
      successResponse(mockRes, 200, { data: 'test' }, undefined);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: undefined,
        data: { data: 'test' }
      });
    });

    test('should handle undefined errors', () => {
      errorResponse(mockRes, 400, 'Error', undefined);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
        errors: undefined
      });
    });

    test('should handle zero status code', () => {
      successResponse(mockRes, 0, { data: 'test' });

      expect(mockRes.status).toHaveBeenCalledWith(0);
    });

    test('should handle very large status code', () => {
      successResponse(mockRes, 999, { data: 'test' });

      expect(mockRes.status).toHaveBeenCalledWith(999);
    });
  });

  describe('Response Format Consistency', () => {
    test('should maintain consistent success response format', () => {
      const testCases = [
        { data: { user: 'test' }, message: 'Success' },
        { data: [], message: 'Empty' },
        { data: null, message: null },
        { data: undefined, message: undefined }
      ];

      testCases.forEach(({ data, message }) => {
        mockRes.status.mockClear();
        mockRes.json.mockClear();

        successResponse(mockRes, 200, data, message);

        const response = mockRes.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response).toHaveProperty('data');
        if (message !== undefined) {
          expect(response).toHaveProperty('message');
        }
      });
    });

    test('should maintain consistent error response format', () => {
      const testCases = [
        { message: 'Error', errors: { field: 'error' } },
        { message: 'Error', errors: undefined },
        { message: '', errors: null },
        { message: null, errors: {} }
      ];

      testCases.forEach(({ message, errors }) => {
        mockRes.status.mockClear();
        mockRes.json.mockClear();

        errorResponse(mockRes, 400, message, errors);

        const response = mockRes.json.mock.calls[0][0];
        expect(response.success).toBe(false);
        expect(response).toHaveProperty('message');
        if (errors !== undefined) {
          expect(response).toHaveProperty('errors');
        }
      });
    });
  });
}); 