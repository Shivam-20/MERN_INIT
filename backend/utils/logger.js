const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Development format with colors
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  logFormat
);

// Production format (JSON)
const prodFormat = combine(
  timestamp(),
  format.errors({ stack: true }),
  json()
);

// Create logger instance
const logger = createLogger({
  level: 'info',
  format: config.env === 'development' ? devFormat : prodFormat,
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level `info` and below to `combined.log`
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// If we're not in production, log to the console as well
if (config.env === 'development') {
  logger.add(
    new transports.Console({
      format: devFormat,
    })
  );
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't crash the process in development
  if (config.env === 'production') process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash the process in development
  if (config.env === 'production') process.exit(1);
});

// Stream for morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
