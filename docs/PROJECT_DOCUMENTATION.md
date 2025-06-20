# Encriptofy Project Documentation

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Status:** Active Development

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Setup & Installation](#setup--installation)
7. [Development Workflow](#development-workflow)
8. [Deployment](#deployment)
9. [API Reference](#api-reference)
10. [Security](#security)
11. [Testing](#testing)
12. [Maintenance](#maintenance)
13. [Known Issues](#known-issues)
14. [Future Roadmap](#future-roadmap)

## 🌟 Project Overview

Encriptofy is a comprehensive full-stack user authentication and authorization system featuring role-based access control, built with modern web technologies. The application provides secure user management with both user and admin interfaces.

### Purpose
- Secure user authentication and authorization
- Role-based access control (Admin/User)
- User profile management
- Admin dashboard for user management
- Modern, responsive UI/UX

### Key Capabilities
- User registration and login
- JWT-based authentication
- Password reset functionality
- Admin user management
- Security hardening and protection
- Docker containerization
- Production-ready deployment

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│  (Node.js/      │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Express)      │    │   Port: 27017   │
│                 │    │   Port: 5000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx         │
                    │   (Production)  │
                    │   Port: 80/443  │
                    └─────────────────┘
```

### Data Flow
1. User interacts with React frontend
2. Frontend makes API calls to Express backend
3. Backend processes requests and authenticates using JWT
4. Database operations performed via Mongoose ODM
5. Responses sent back through the chain

## 🛠️ Technology Stack

### Frontend
- **React** 19.1.0 - UI library
- **Vite** 6.3.5 - Build tool and dev server
- **React Router DOM** 7.6.2 - Client-side routing
- **Tailwind CSS** 3.4.1 - Utility-first CSS framework
- **Axios** 1.9.0 - HTTP client
- **React Toastify** 11.0.5 - Toast notifications
- **Heroicons** 2.2.0 - Icon library

### Backend
- **Node.js** 16+ - Runtime environment
- **Express** 4.18.2 - Web framework
- **MongoDB** 6.0 - NoSQL database
- **Mongoose** 8.0.3 - MongoDB object modeling
- **Passport.js** 0.7.0 - Authentication middleware
- **JWT** 9.0.2 - JSON Web Tokens
- **bcryptjs** 2.4.3 - Password hashing

### Security & Middleware
- **Helmet** 8.1.0 - Security headers
- **CORS** 2.8.5 - Cross-origin resource sharing
- **express-rate-limit** 7.5.0 - Rate limiting
- **express-mongo-sanitize** 2.2.0 - NoSQL injection protection
- **xss-clean** 0.1.4 - XSS protection
- **hpp** 0.2.3 - Parameter pollution protection

### DevOps & Tools
- **Docker** & **Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Concurrently** - Run multiple commands

## ✨ Features

### Authentication Features
- [x] User registration with email verification
- [x] User login/logout
- [x] JWT-based authentication
- [x] Password reset functionality
- [x] Remember me functionality
- [x] Secure password hashing

### User Management
- [x] User profile management
- [x] Password update functionality
- [x] Role-based access control (Admin/User)
- [x] User account activation/deactivation

### Admin Features
- [x] Admin dashboard
- [x] User management (CRUD operations)
- [x] Role management
- [x] System monitoring

### Security Features
- [x] Rate limiting
- [x] CORS protection
- [x] XSS protection
- [x] NoSQL injection protection
- [x] Parameter pollution protection
- [x] Security headers with Helmet
- [x] Input validation and sanitization

### UI/UX Features
- [x] Responsive design
- [x] Modern UI with Tailwind CSS
- [x] Loading states and error handling
- [x] Toast notifications
- [x] Protected routes
- [x] Form validation

## 📁 Project Structure

```
encriptofy/
├── client/                     # Frontend React application
│   ├── public/                # Static assets
│   │   ├── components/        # Reusable components
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── NavLink.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Custom hooks
│   │   │   └── useDropdown.js
│   │   ├── pages/             # Page components
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboardPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── UpdatePasswordPage.jsx
│   │   ├── services/          # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── userService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                    # Backend Node.js application
│   ├── config/
│   │   └── passport.js       # Passport configuration
│   ├── controllers/
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── models/
│   │   └── User.js          # User model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── userRoutes.js    # User management routes
│   ├── utils/
│   │   └── errorHandler.js  # Error handling utilities
│   ├── index.js             # Main server file
│   └── package.json
│
├── backend/                   # Coverage reports (generated)
│   └── coverage/
│
├── nginx/                     # Nginx configuration
│   ├── conf.d/
│   │   └── app.conf
│   ├── nginx.conf
│   └── ssl/                  # SSL certificates
│
├── docker-compose.yml         # Development Docker configuration
├── docker-compose.prod.yml    # Production Docker configuration
├── Dockerfile                 # Production Dockerfile
├── Dockerfile.dev            # Development Dockerfile
├── Dockerfile.nginx          # Nginx Dockerfile
├── package.json              # Root package.json
├── README.md                 # Project README
├── DEPLOYMENT.md             # Deployment guide
└── PROJECT_DOCUMENTATION.md  # This file
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ and npm 8+
- Docker and Docker Compose (optional)
- MongoDB 6.0+ (local or Atlas)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/encriptofy.git
   cd encriptofy
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create environment file
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/encriptofy
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=1d
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start the application**
   ```bash
   # Start both frontend and backend
   npm run dev
   ```

### Docker Development Setup

1. **Using Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017

## 💻 Development Workflow

### Available Scripts

#### Root Directory
- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

#### Server Directory
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend in production mode

#### Client Directory
- `npm run dev` - Start frontend dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Standards
- ESLint configuration for code quality
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits encouraged

### Git Workflow
1. Create feature branch from `main`
2. Make changes and commit
3. Push to GitHub and create PR
4. Code review and merge

## 🚀 Deployment

### Production Deployment Options

#### Option 1: Docker Production Deployment
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Option 2: Manual Deployment
See `DEPLOYMENT.md` for detailed production deployment instructions.

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/encriptofy
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_admin_password
```

## 📡 API Reference

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Forgot password
- `PATCH /api/v1/auth/reset-password/:token` - Reset password

### User Management Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile
- `PATCH /api/v1/users/update-password` - Update password
- `DELETE /api/v1/users/me` - Delete user account

### Admin Endpoints
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID (Admin only)
- `PATCH /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Health Check
- `GET /api/health` - Server health check

## 🔒 Security

### Implemented Security Measures
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Sanitize and validate all inputs
- **CORS Protection** - Configured for security
- **Security Headers** - Helmet.js implementation
- **XSS Protection** - Clean user inputs
- **NoSQL Injection Protection** - Mongoose sanitization
- **Parameter Pollution Protection** - HPP middleware

### Security Best Practices
- Environment variables for sensitive data
- Secure cookie configuration
- Regular dependency updates
- Error handling without information leakage
- Proper authentication checks

## 🧪 Testing

### Current Testing Setup
- **Framework**: Jest
- **Coverage**: 80% threshold required
- **Test Environment**: Node.js test environment

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Strategy
- Unit tests for utilities and services
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

## 🔧 Maintenance

### Regular Maintenance Tasks
1. **Dependencies Update**
   ```bash
   npm audit
   npm update
   ```

2. **Database Maintenance**
   - Regular backups
   - Index optimization
   - Performance monitoring

3. **Security Updates**
   - Regular security audits
   - Dependency vulnerability checks
   - SSL certificate renewal

4. **Performance Monitoring**
   - API response times
   - Database query performance
   - Frontend bundle size

### Backup Strategy
- Automated daily backups
- Weekly full system backups
- Backup retention policy
- Recovery testing

## ⚠️ Known Issues

### Current Issues
1. **Backend Folder** - Contains only coverage reports, may need cleanup
2. **Environment Variables** - Some defaults may need production hardening
3. **Error Handling** - Could be enhanced for better user experience
4. **Testing Coverage** - Needs expansion for full test coverage

### Planned Fixes
- Clean up unnecessary files in backend folder
- Enhance error handling and user feedback
- Expand test coverage
- Add more comprehensive logging

## 🛣️ Future Roadmap

### Short Term (Next 2-3 months)
- [ ] Email verification system
- [ ] Enhanced password policies
- [ ] User activity logging
- [ ] API rate limiting per user
- [ ] Advanced admin analytics

### Medium Term (3-6 months)
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Advanced user roles and permissions
- [ ] API versioning
- [ ] Comprehensive audit logging

### Long Term (6+ months)
- [ ] Multi-tenant support
- [ ] Advanced security features
- [ ] Performance optimization
- [ ] Mobile app development
- [ ] Microservices architecture

## 📞 Support & Contact

### Getting Help
- Check the [Issues](https://github.com/yourusername/encriptofy/issues) page
- Review the [Documentation](README.md)
- Check [Deployment Guide](DEPLOYMENT.md)

### Contributing
- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

---

**Note**: This documentation is maintained alongside the project. Please update it when making significant changes to the codebase or architecture.

**Last Updated**: December 2024  
**Next Review**: January 2025 