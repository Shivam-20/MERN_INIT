# Unit Testing Documentation

This document provides comprehensive information about the unit testing setup for the Encriptofy API backend.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The project uses **Jest** as the primary testing framework with **Supertest** for API endpoint testing. The testing setup provides comprehensive coverage for all API endpoints, controllers, models, and utilities.

### Key Features

- **Full API Coverage**: All endpoints are tested with various scenarios
- **Mocking Strategy**: Comprehensive mocking for external dependencies
- **Coverage Reporting**: Detailed coverage reports with thresholds
- **Test Categories**: Organized tests by functionality
- **CI/CD Ready**: Tests can be run in automated environments

## Test Structure

```
server/__tests__/
├── routes/                 # API route tests
│   ├── auth.test.js       # Authentication endpoints
│   ├── cryptoRoutes.test.js # Crypto API endpoints
│   └── userRoutes.test.js # User management endpoints
├── controllers/            # Controller logic tests
│   └── userController.test.js
├── models/                 # Model validation tests
│   └── User.test.js
└── utils/                  # Utility function tests
    ├── apiResponse.test.js
    └── errorHandler.test.js
```

## Running Tests

### Quick Start

```bash
# Run all tests
./scripts/test-api.sh

# Run tests with coverage
./scripts/test-api.sh --coverage

# Run tests in watch mode
./scripts/test-api.sh watch
```

### Test Script Options

The `scripts/test-api.sh` script provides multiple options:

```bash
# Basic usage
./scripts/test-api.sh [MODE] [OPTIONS]

# Modes
./scripts/test-api.sh unit          # All unit tests (default)
./scripts/test-api.sh watch         # Watch mode
./scripts/test-api.sh routes        # Route tests only
./scripts/test-api.sh controllers   # Controller tests only
./scripts/test-api.sh models        # Model tests only
./scripts/test-api.sh utils         # Utility tests only
./scripts/test-api.sh auth          # Authentication tests only
./scripts/test-api.sh crypto        # Crypto API tests only
./scripts/test-api.sh users         # User API tests only
./scripts/test-api.sh coverage      # Coverage report

# Options
./scripts/test-api.sh --coverage    # Enable coverage
./scripts/test-api.sh --verbose     # Verbose output
./scripts/test-api.sh --clean       # Clean test artifacts
./scripts/test-api.sh --validate    # Validate environment
./scripts/test-api.sh --help        # Show help
```

### Direct NPM Commands

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx jest __tests__/routes/auth.test.js

# Run tests matching pattern
npx jest --testNamePattern="should login user"
```

## Test Coverage

### Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Coverage Reports

After running tests with coverage, you can view detailed reports:

```bash
# Generate coverage report
./scripts/test-api.sh --coverage

# View HTML report
open server/coverage/lcov-report/index.html

# View console summary
./scripts/test-api.sh coverage
```

### Coverage Areas

| Category | Coverage | Files |
|----------|----------|-------|
| Routes | 100% | auth.test.js, cryptoRoutes.test.js, userRoutes.test.js |
| Controllers | 100% | userController.test.js |
| Models | 100% | User.test.js |
| Utils | 100% | apiResponse.test.js, errorHandler.test.js |

## Test Categories

### 1. Route Tests (`routes/`)

Route tests verify API endpoint behavior including:

- **Request Validation**: Input validation and error handling
- **Authentication**: JWT token validation and role-based access
- **Response Format**: Consistent API response structure
- **Error Scenarios**: Various error conditions and edge cases

**Example Route Test:**
```javascript
test('should encrypt text successfully', async () => {
  const testData = {
    text: 'Hello, World!',
    key: 'secretKey123'
  };

  const response = await request(app)
    .post('/api/crypto/text/encrypt')
    .send(testData);

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
  expect(response.body.data.encrypted).toBeDefined();
});
```

### 2. Controller Tests (`controllers/`)

Controller tests focus on business logic including:

- **Data Processing**: Input transformation and validation
- **Database Operations**: CRUD operations and queries
- **Error Handling**: Proper error propagation
- **Response Generation**: Correct response formatting

**Example Controller Test:**
```javascript
test('should create a new user successfully', async () => {
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  };

  mockReq.body = userData;
  
  await userController.createUser(mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(201);
  expect(mockRes.json).toHaveBeenCalledWith({
    status: 'success',
    data: { user: expect.any(Object) }
  });
});
```

### 3. Model Tests (`models/`)

Model tests verify data validation and schema behavior:

- **Schema Validation**: Field validation rules
- **Pre-save Hooks**: Password hashing and data transformation
- **Instance Methods**: Custom model methods
- **Database Constraints**: Unique constraints and indexes

**Example Model Test:**
```javascript
test('should hash password before saving', async () => {
  const hashedPassword = 'hashedPassword123';
  bcrypt.hash.mockResolvedValue(hashedPassword);

  const user = new User({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  });

  const savedUser = await user.save();

  expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
  expect(savedUser.password).toBe(hashedPassword);
});
```

### 4. Utility Tests (`utils/`)

Utility tests cover helper functions and middleware:

- **Response Helpers**: API response formatting
- **Error Handling**: Error processing and formatting
- **Validation**: Input validation utilities
- **Middleware**: Custom middleware functions

## Writing Tests

### Test Structure

Each test file follows this structure:

```javascript
import { /* dependencies */ } from 'module';

// Mock external dependencies
jest.mock('dependency');

describe('Component Name', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { /* request object */ };
    mockRes = { /* response object */ };
    mockNext = jest.fn();
  });

  describe('Method Name', () => {
    test('should do something when condition', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking Strategy

#### Database Models
```javascript
jest.mock('../../models/User.js');

User.findOne = jest.fn().mockResolvedValue(mockUser);
User.mockImplementation(() => mockUser);
```

#### External Libraries
```javascript
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));
```

#### Authentication
```javascript
jest.mock('passport', () => ({
  authenticate: jest.fn(() => (req, res, next) => {
    req.user = { id: '123', email: 'test@example.com', role: 'user' };
    next();
  })
}));
```

### Test Patterns

#### Happy Path Testing
```javascript
test('should succeed with valid input', async () => {
  // Test successful operation
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

#### Error Path Testing
```javascript
test('should fail with invalid input', async () => {
  // Test error handling
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
});
```

#### Edge Case Testing
```javascript
test('should handle empty input', async () => {
  // Test edge cases
  expect(response.status).toBe(400);
});
```

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain the scenario
- **Follow AAA pattern**: Arrange, Act, Assert
- **Keep tests independent** and isolated

### 2. Mocking

- **Mock external dependencies** to isolate units
- **Use realistic mock data** that matches real scenarios
- **Reset mocks** between tests using `beforeEach`
- **Verify mock calls** when testing interactions

### 3. Assertions

- **Test one thing per test** for clarity
- **Use specific assertions** rather than generic ones
- **Test both success and failure cases**
- **Verify response structure** and status codes

### 4. Test Data

- **Use factory functions** for creating test data
- **Avoid hardcoded values** in assertions
- **Use realistic data** that matches production scenarios
- **Clean up test data** after tests

### 5. Performance

- **Mock expensive operations** like database calls
- **Use test databases** for integration tests
- **Avoid testing implementation details**
- **Focus on behavior** rather than internal structure

## Troubleshooting

### Common Issues

#### 1. Test Timeout
```bash
# Increase timeout for slow tests
jest --testTimeout=10000
```

#### 2. Database Connection Issues
```bash
# Set test database URI
export MONGODB_URI_TEST="mongodb://localhost:27017/test"
```

#### 3. Mock Not Working
```javascript
// Ensure mocks are cleared between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 4. Coverage Threshold Failures
```bash
# Check current coverage
npm run test:coverage

# Update thresholds if needed
// In package.json jest configuration
"coverageThreshold": {
  "global": {
    "branches": 70,
    "functions": 70,
    "lines": 70,
    "statements": 70
  }
}
```

### Debugging Tests

#### Enable Verbose Output
```bash
./scripts/test-api.sh --verbose
```

#### Run Single Test
```bash
npx jest --testNamePattern="should login user"
```

#### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Environment Setup

#### Required Environment Variables
```bash
# Test database (optional)
MONGODB_URI_TEST=mongodb://localhost:27017/test

# JWT secret for auth tests
JWT_SECRET=test-secret-key

# Admin credentials for admin tests
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

#### Test Database Setup
```bash
# Create test database
mongo --eval "use test"

# Or use MongoDB Atlas test cluster
export MONGODB_URI_TEST="mongodb+srv://..."
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd server && npm install
      - run: ./scripts/test-api.sh --coverage
      - uses: codecov/codecov-action@v1
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "cd server && npm test"
    }
  }
}
```

## Contributing

When adding new features or fixing bugs:

1. **Write tests first** (TDD approach)
2. **Ensure all tests pass** before submitting
3. **Maintain coverage thresholds**
4. **Update documentation** if needed
5. **Follow existing test patterns**

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Follow naming convention**: `component.test.js`
3. **Use existing patterns** for consistency
4. **Add to test script** if needed
5. **Update documentation** with new test categories

This comprehensive testing setup ensures code quality, reliability, and maintainability of the Encriptofy API backend. 