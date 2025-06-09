# Encriptofy Backend API

This is the backend API for the Encriptofy admin panel, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure JWT-based authentication with email/password
- **Role-Based Access Control**: Fine-grained permissions for users and admins
- **User Management**: Full CRUD operations for user accounts
- **Password Management**: Secure password reset flow with email verification
- **Security**: Rate limiting, CORS, Helmet, and other security best practices
- **API Documentation**: Interactive API documentation with Swagger/OpenAPI
- **Error Handling**: Comprehensive error handling and logging
- **Email Notifications**: Welcome emails and password reset functionality
- **File Uploads**: Support for user profile pictures and other uploads

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Development](#development)
  - [Running the Server](#running-the-server)
  - [API Documentation](#api-documentation-1)
  - [Testing](#testing)
  - [Linting](#linting)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or later) or MongoDB Atlas account
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/encriptofy-backend.git
   cd encriptofy-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (see Environment Variables section below)

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The server will start on `http://localhost:5000` by default.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/encriptofy

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email (for password reset, etc.)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Frontend URL (for password reset links, etc.)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60 * 60 * 1000 // 1 hour
RATE_LIMIT_MAX_REQUESTS=100
```

## API Documentation

This API is documented using the OpenAPI 3.0 specification. You can access the interactive API documentation in the following ways:

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the Swagger UI at: `http://localhost:5000/api-docs`

### Generating Documentation

To generate a static OpenAPI specification file:

```bash
# Generate the OpenAPI specification
npm run docs:generate

# The specification will be saved to swagger-output.json
```

### Viewing Documentation

You can view the generated documentation using:

1. **Swagger UI** (interactive):
   ```bash
   npx swagger serve swagger-output.json
   ```
   Then open `http://localhost:3001` in your browser.

2. **Redoc** (beautiful static docs):
   ```bash
   npx redoc-cli serve swagger-output.json
   ```
   Then open `http://localhost:8080` in your browser.

## Development

### Running the Server

```bash
# Install dependencies
npm install

# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm test -- --coverage
```

### Linting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Deployment

### Prerequisites

- Node.js and npm installed on the server
- MongoDB database (local or MongoDB Atlas)
- Environment variables configured

### Steps

1. Clone the repository on your server
2. Install dependencies:
   ```bash
   npm install --production
   ```
3. Set up environment variables in `.env`
4. Build the application:
   ```bash
   npm run build
   ```
5. Start the production server:
   ```bash
   npm start
   ```

### PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "encriptofy-api"

# Save the process list
pm2 save

# Set up startup script
pm2 startup

# Monitor the application
pm2 monit
```

## API Reference

### Authentication

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST   | `/api/v1/auth/signup` | Register a new user | None |
| POST   | `/api/v1/auth/login` | User login | None |
| POST   | `/api/v1/auth/forgot-password` | Request password reset | None |
| PATCH  | `/api/v1/auth/reset-password/:token` | Reset password | None |
| GET    | `/api/v1/auth/logout` | Logout | JWT Token |
| PATCH  | `/api/v1/auth/update-my-password` | Update password | JWT Token |
| PATCH  | `/api/v1/auth/update-me` | Update profile | JWT Token |
| DELETE | `/api/v1/auth/delete-me` | Delete account | JWT Token |

### Users (Admin Only)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET    | `/api/v1/users` | Get all users | Admin |
| POST   | `/api/v1/users` | Create a new user | Admin |
| GET    | `/api/v1/users/:id` | Get user by ID | Admin |
| PATCH  | `/api/v1/users/:id` | Update user | Admin |
| DELETE | `/api/v1/users/:id` | Delete user | Admin |
| PATCH  | `/api/v1/users/:id/toggle-active` | Toggle user active status | Admin |
| PATCH  | `/api/v1/users/:id/role` | Update user role | Admin |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
