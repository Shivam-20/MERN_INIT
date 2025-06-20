# Encriptofy - Project State Documentation

**Last Updated:** June 2025
**Version:** 1.0.0
**Status:** Active Development

## Project Overview

Encriptofy is a full-stack user authentication and authorization system with role-based access control, built with React, Node.js, Express, and MongoDB. The application provides secure user management with both user and admin interfaces.

## Current Architecture

### System Components
- **Frontend**: React 19.1.0 with Vite build tool
- **Backend**: Node.js with Express 4.18.2
- **Database**: MongoDB 6.0
- **Authentication**: JWT-based with Passport.js
- **Deployment**: Docker containerization ready

### Technology Stack

#### Frontend Technologies
- React 19.1.0 - UI library
- Vite 6.3.5 - Build tool and dev server  
- React Router DOM 7.6.2 - Client-side routing
- Tailwind CSS 3.4.1 - CSS framework
- Axios 1.9.0 - HTTP client
- React Toastify 11.0.5 - Notifications

#### Backend Technologies
- Node.js 16+ - Runtime
- Express 4.18.2 - Web framework
- MongoDB 6.0 - Database
- Mongoose 8.0.3 - ODM
- Passport.js 0.7.0 - Authentication
- JWT 9.0.2 - Token management
- bcryptjs 2.4.3 - Password hashing

#### Security & Middleware
- Helmet 8.1.0 - Security headers
- CORS 2.8.5 - Cross-origin handling
- express-rate-limit 7.5.0 - Rate limiting
- express-mongo-sanitize 2.2.0 - NoSQL injection protection
- xss-clean 0.1.4 - XSS protection

## Current Features

### ✅ Implemented Features
- User registration and login
- JWT-based authentication
- Password reset functionality
- User profile management
- Role-based access control (Admin/User)
- Admin dashboard for user management
- Responsive UI with Tailwind CSS
- Security middleware and protection
- Docker containerization
- Production deployment configuration

### 🔒 Security Features
- Password hashing with bcrypt
- Rate limiting protection
- XSS and NoSQL injection prevention
- Security headers with Helmet
- Input validation and sanitization
- CORS configuration

## Project Structure Analysis

### Frontend Structure (`/client`)
```
client/
├── src/
│   ├── components/
│   │   ├── AdminRoute.jsx       # Admin route protection
│   │   ├── PrivateRoute.jsx     # User route protection
│   │   └── NavLink.jsx          # Navigation component
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminDashboardPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   └── UpdatePasswordPage.jsx
│   ├── services/
│   │   ├── api.js               # API configuration
│   │   ├── authService.js       # Auth service
│   │   └── userService.js       # User service
│   └── hooks/
│       └── useDropdown.js       # Custom hook
```

### Backend Structure (`/server`)
```
server/
├── config/
│   └── passport.js              # Passport configuration
├── controllers/
│   └── userController.js        # User controller
├── middleware/
│   └── auth.js                  # Auth middleware
├── models/
│   └── User.js                  # User model
├── routes/
│   ├── auth.js                  # Auth routes
│   └── userRoutes.js            # User routes
├── utils/
│   └── errorHandler.js          # Error handling
└── index.js                     # Main server file
```

### Infrastructure Files
- `docker-compose.yml` - Development Docker configuration
- `docker-compose.prod.yml` - Production Docker configuration
- `nginx/` - Nginx configuration for production
- `DEPLOYMENT.md` - Deployment documentation
- Various shell scripts for automation

## Current API Endpoints

### Authentication Routes (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `PATCH /reset-password/:token` - Password reset

### User Routes (`/api/v1/users`)
- `GET /me` - Get current user profile
- `PATCH /me` - Update user profile
- `PATCH /update-password` - Update password
- `DELETE /me` - Delete user account
- Admin-only routes for user management

### Health Check
- `GET /api/health` - Server health status

## Development Environment

### Available Scripts
```bash
# Root level
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build frontend for production

# Server level
npm run dev          # Start with nodemon
npm start            # Production start

# Client level  
npm run dev          # Start dev server
npm run build        # Build for production
```

### Development Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## Docker Configuration

### Development (`docker-compose.yml`)
- MongoDB service on port 27017
- Backend service on port 5000
- Frontend service on port 3000
- Volume mounting for hot reload

### Production (`docker-compose.prod.yml`)
- Optimized for production deployment
- Nginx reverse proxy
- SSL configuration ready
- Health checks configured

## Current Issues & Technical Debt

### Identified Issues
1. **Backend Folder**: Contains only coverage reports, may need cleanup
2. **Environment Variables**: Some defaults need production hardening
3. **Testing**: Limited test coverage, needs expansion
4. **Error Handling**: Could be enhanced for better UX

### Code Quality
- ESLint configuration present
- Prettier formatting setup
- Husky git hooks configured
- Coverage threshold set to 80%

## Security Posture

### Implemented Security Measures
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 requests/hour)
- Input sanitization and validation
- XSS protection
- NoSQL injection prevention
- Security headers with Helmet
- CORS configuration

### Security Considerations
- Environment variables for secrets
- Secure cookie configuration
- Error handling without info leakage
- Regular dependency updates needed

## Deployment Status

### Deployment Options
1. **Docker Compose** - Ready for containerized deployment
2. **Manual Deployment** - Documented in DEPLOYMENT.md
3. **CI/CD** - GitHub Actions workflow configured

### Production Readiness
- ✅ Docker containerization
- ✅ Environment configuration
- ✅ Security hardening
- ✅ Nginx configuration
- ✅ SSL/TLS ready
- ✅ Health checks
- ✅ Backup scripts

## Maintenance Tasks

### Regular Tasks
- Dependency updates and security audits
- Database backups and maintenance
- SSL certificate renewal
- Performance monitoring
- Log rotation and cleanup

### Monitoring
- Health check endpoint available
- Error logging implemented
- Request logging with Morgan
- Database connection monitoring

## Future Enhancements

### Short Term
- Email verification system
- Enhanced error handling
- Expanded test coverage
- Code cleanup and optimization

### Medium Term
- Two-factor authentication
- OAuth integration
- Advanced user roles
- API rate limiting per user

### Long Term
- Multi-tenant support
- Microservices architecture
- Mobile app support
- Advanced analytics

## Contact & Support

For questions or issues:
- Check existing documentation
- Review GitHub issues
- Consult deployment guide
- Review API documentation

---

**Documentation Maintenance**: This file should be updated whenever significant changes are made to the project architecture, features, or deployment configuration. 
## 📈 Latest Update Summary

**Update Date:** June 2025
**Updated By:** shivamap20

### Recent Changes


### Package Versions Status
- React: ^19.1.0
undefined
- Vite: ^6.3.5
undefined  
- Express: ^4.18.2
undefined
- Mongoose: ^8.0.3
undefined
- Passport.js: ^0.7.0
undefined

### Quick Health Check
- ✅ Documentation updated
- ✅ Docker config present
- ✅ Environment template present
- ✅ Root package.json present
- ✅ Frontend directory present
- ✅ Backend directory present

---
*Auto-generated by update-docs.sh*

