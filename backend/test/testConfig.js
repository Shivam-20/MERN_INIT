// Test configuration
module.exports = {
  port: process.env.PORT || 3000,
  env: 'test',
  jwt: {
    secret: 'test_jwt_secret',
    expiresIn: '1h',
    cookieExpiresIn: '1'
  },
  database: {
    uri: 'mongodb://localhost:27017/encriptofy_test',
    options: {
      // Remove deprecated options for MongoDB Node.js driver v4+
      // These options are no longer needed in the latest versions
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    } // Added missing closing bracket here
  },
  email: {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'testpass'
    },
    from: 'Encriptofy Test <test@example.com>'
  },
  frontendUrl: 'http://localhost:3000',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  }
};
