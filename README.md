# Encriptofy - User Authentication# Encriptofy

A full-stack user authentication and authorization system with admin and user roles, built with React, Node.js, Express, and MongoDB.

## ✨ Features

- **User Authentication**
  - Registration with email and password
  - Login/Logout functionality
  - JWT-based authentication
  - Password reset functionality
  - Remember me option

- **User Management**
  - User profile management
  - Role-based access control (Admin/User)
  - Account activation/deactivation
  - Password update

- **Admin Dashboard**
  - User management (CRUD operations)
  - Role management
  - Activity logs
  - System statistics

- **Security**
  - Password hashing with bcrypt
  - Rate limiting
  - Helmet for security headers
  - CSRF protection
  - XSS protection
  - NoSQL injection protection
  - Parameter pollution protection

- **Developer Experience**
  - ES Modules support
  - Environment-based configuration
  - Comprehensive error handling
  - Request validation
  - API documentation
  - Test coverage

## 🚀 Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Query** - Data fetching and caching
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for authentication
- **Express Validator** - Request validation
- **Winston** - Logging
- **Jest** - Testing framework

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message linting

## 📦 Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher) or yarn (v1.22 or higher)
- MongoDB (v5.0 or higher) - local or Atlas
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/encriptofy.git
   cd encriptofy
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example .env file
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration.

3. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Backend server at http://localhost:5000
   - Frontend development server at http://localhost:3000

## 🚦 Available Scripts

### Root Directory

| Script | Description |
|--------|-------------|
| `npm install` | Install all dependencies (root, server, and client) |
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run server` | Start only the backend server |
| `npm run client` | Start only the frontend |
| `npm run build` | Build the frontend for production |
| `npm test` | Run tests for both frontend and backend |
| `npm run lint` | Lint all JavaScript/TypeScript files |
| `npm run format` | Format all files with Prettier |

### Server Directory

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start the development server with nodemon |
| `npm test` | Run backend tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run lint` | Lint server code |
| `npm run seed` | Seed the database with test data |

### Client Directory

| Script | Description |
|--------|-------------|
| `npm start` | Start the development server |
| `npm run build` | Build for production |
| `npm test` | Run frontend tests |
| `npm run lint` | Lint client code |
| `npm run preview` | Preview production build locally |

## 📁 Project Structure

```
encriptofy/
├── client/                     # Frontend React application
│   ├── public/                # Static files (images, fonts, etc.)
│   └── src/                   # React source code
│       ├── assets/            # Images, icons, fonts, etc.
│       ├── components/        # Reusable UI components
│       │   ├── common/        # Common components (buttons, inputs, etc.)
│       │   ├── layout/        # Layout components (header, footer, etc.)
│       │   └── ui/            # UI components
│       ├── config/            # Configuration files
│       ├── constants/         # Application constants
│       ├── contexts/          # React contexts
│       ├── features/          # Feature-based modules
│       │   ├── auth/          # Authentication feature
│       │   ├── dashboard/     # Dashboard feature
│       │   └── users/         # Users management feature
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Library code
│       ├── pages/             # Page components
│       ├── routes/            # Route definitions
│       ├── services/          # API service layer
│       ├── store/             # State management
│       ├── styles/            # Global styles
│       ├── types/             # TypeScript type definitions
│       ├── utils/             # Utility functions
│       ├── App.jsx            # Main App component
│       └── main.jsx           # Entry point
│
├── server/                    # Backend Node.js application
│   ├── config/               # Configuration files
│   │   ├── db.js            # Database configuration
│   │   ├── passport.js      # Passport configuration
│   │   └── env.js           # Environment configuration
│   │
│   ├── controllers/        # Route controllers
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   │
│   ├── middlewares/        # Custom middlewares
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── models/             # Database models
│   │   ├── user.model.js
│   │   └── token.model.js
│   │
│   ├── routes/             # API routes
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/           # Business logic
│   ├── utils/               # Utility functions
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   └── logger.js
│   │
│   ├── validations/        # Request validations
│   ├── app.js               # Express app configuration
│   └── server.js            # Server entry point
│
├── .env.example            # Example environment variables
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── package.json             # Root package.json
└── README.md                # This file
```

## 🌐 API Documentation

### Authentication

#### Register a new user
```http
POST /api/v1/auth/register
```

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Response**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "5f8d0d55b54764421b7160cb",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### Login user
```http
POST /api/v1/auth/login
```

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "5f8d0d55b54764421b7160cb",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Users

#### Get current user (protected)
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Response**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "5f8d0d55b54764421b7160cb",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Get all users (admin only)
```http
GET /api/v1/users
Authorization: Bearer <admin-token>
```

**Response**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "users": [
      {
        "id": "5f8d0d55b54764421b7160cb",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "active": true,
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": "5f8d0d55b54764421b7160cc",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "active": true,
        "createdAt": "2023-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

## 🔒 Environment Variables

See [.env.example](.env.example) for all available environment variables.

## 🐳 Docker Support

### Development

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Production

```bash
# Build and start containers in production mode
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
cd server
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

### Frontend Tests

```bash
# Run all tests
cd client
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Backend

1. **Set up a production MongoDB database**
   - Use MongoDB Atlas or self-hosted MongoDB
   - Update `MONGODB_URI` in your production environment

2. **Set up environment variables**
   - Create a `.env` file in the server directory
   - Configure all required environment variables

3. **Install dependencies**
   ```bash
   npm install --production
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   Or using PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "encriptofy-api" -- start
   pm2 save
   pm2 startup
   ```

### Frontend

1. **Build the React app**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy the build folder**
   - Copy the contents of the `build` folder to your static hosting provider
   - Configure the `REACT_APP_API_URL` environment variable to point to your backend API

### Using Docker (Production)

1. Build and start the production containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. The application will be available at `http://your-server-ip`

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the project
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - The database for modern applications
- [Mongoose](https://mongoosejs.com/) - Elegant MongoDB object modeling for Node.js
- [JWT](https://jwt.io/) - JSON Web Tokens
- [Passport.js](http://www.passportjs.org/) - Simple, unobtrusive authentication for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourusername) - your.email@example.com

Project Link: [https://github.com/yourusername/encriptofy](https://github.com/yourusername/encriptofy)

## 📚 Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction/)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
