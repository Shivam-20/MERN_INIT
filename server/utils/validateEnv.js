/**
 * Environment Variable Validation Utility
 * Validates and sanitizes environment variables on server startup
 */

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing or invalid
 */
export const validateEnvironment = () => {
  const errors = [];
  
  // Required variables
  const required = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  // Check for missing required variables
  required.forEach(variable => {
    if (!process.env[variable]) {
      errors.push(`Missing required environment variable: ${variable}`);
    }
  });
  
  // Validate NODE_ENV
  const validEnvironments = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvironments.includes(process.env.NODE_ENV)) {
    errors.push(`NODE_ENV must be one of: ${validEnvironments.join(', ')}`);
  }
  
  // Validate PORT
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push('PORT must be a valid port number (1-65535)');
  }
  
  // Validate JWT_SECRET strength (production only)
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long in production');
    }
    
    // Check for default/weak secrets
    const weakSecrets = [
      'your_jwt_secret_key_here',
      'your_super_secret_jwt_key_change_this_in_production',
      'secret',
      'jwt_secret'
    ];
    
    if (jwtSecret && weakSecrets.includes(jwtSecret)) {
      errors.push('JWT_SECRET appears to be a default value. Please use a strong, unique secret in production');
    }
  }
  
  // Validate MongoDB URI format
  if (process.env.MONGODB_URI) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      errors.push('MONGODB_URI must be a valid MongoDB connection string');
    }
  }
  
  // Validate BCRYPT_SALT_ROUNDS
  if (process.env.BCRYPT_SALT_ROUNDS) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    if (isNaN(saltRounds) || saltRounds < 10 || saltRounds > 15) {
      errors.push('BCRYPT_SALT_ROUNDS must be a number between 10 and 15');
    }
  }
  
  // Validate RATE_LIMIT_MAX
  if (process.env.RATE_LIMIT_MAX) {
    const rateLimit = parseInt(process.env.RATE_LIMIT_MAX);
    if (isNaN(rateLimit) || rateLimit < 1) {
      errors.push('RATE_LIMIT_MAX must be a positive number');
    }
  }
  
  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    // Check for secure admin credentials
    if (process.env.ADMIN_PASSWORD === 'admin123' || 
        process.env.ADMIN_PASSWORD === 'password' ||
        (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 8)) {
      errors.push('ADMIN_PASSWORD must be at least 8 characters long and not a default value in production');
    }
    
    // Warn about development URLs in production
    if (process.env.CLIENT_URL && process.env.CLIENT_URL.includes('localhost')) {
      console.warn('⚠️  Warning: CLIENT_URL contains localhost in production environment');
    }
  }
  
  // Throw error if any validation failed
  if (errors.length > 0) {
    console.error('❌ Environment Validation Failed:');
    errors.forEach(error => console.error(`   • ${error}`));
    throw new Error(`Environment validation failed with ${errors.length} error(s)`);
  }
  
  console.log('✅ Environment validation passed');
};

/**
 * Get environment variable with default value
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value or default
 */
export const getEnvVar = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * Get environment variable as integer
 * @param {string} key - Environment variable name
 * @param {number} defaultValue - Default value if not set
 * @returns {number} Environment variable as integer or default
 */
export const getEnvInt = (key, defaultValue = 0) => {
  const value = process.env[key];
  return value ? parseInt(value) : defaultValue;
};

/**
 * Get environment variable as boolean
 * @param {string} key - Environment variable name
 * @param {boolean} defaultValue - Default value if not set
 * @returns {boolean} Environment variable as boolean or default
 */
export const getEnvBool = (key, defaultValue = false) => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Check if running in production
 * @returns {boolean} True if NODE_ENV is production
 */
export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 * @returns {boolean} True if NODE_ENV is development
 */
export const isDevelopment = () => process.env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 * @returns {boolean} True if NODE_ENV is test
 */
export const isTest = () => process.env.NODE_ENV === 'test';