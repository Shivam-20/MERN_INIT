const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

// Load config
const config = require('./config/config');
const swaggerSpec = require('./config/swagger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const healthCheckRoutes = require('./routes/healthCheckRoutes');

// Import test routes for development
let testRoutes;
if (config.env === 'development') {
  testRoutes = require('./routes/testRoutes');
}

// Import middleware
const { globalRateLimiter, authRateLimiter } = require('./middleware/rateLimiter');

// Import error handler
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Start express app
const app = express();

// 1) GLOBAL MIDDLEWARES

// Implement CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting to API routes
app.use('/api', globalRateLimiter);

// Apply stronger rate limiting to auth routes
app.use('/api/v1/auth', authRateLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'sort',
    'page',
    'limit',
    'fields'
  ]
}));

// Compression
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
// API Documentation
if (config.env === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // API Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

app.use('/api/health', healthCheckRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

// Test routes (development only)
if (config.env === 'development') {
  app.use('/api/v1/test', testRoutes);
}

// 3) ERROR HANDLING
// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
