const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Encriptofy API',
      version: '1.0.0',
      description: 'API documentation for Encriptofy admin panel',
      contact: {
        name: 'Encriptofy Support',
        email: 'support@encriptofy.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'https://api.encriptofy.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Please log in to get access',
                  },
                },
              },
            },
          },
        },
        BadRequest: {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid input data',
                  },
                  errors: {
                    type: 'object',
                    additionalProperties: true,
                  },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'No document found with that ID',
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              format: 'ObjectId',
              example: '5f8d0f4d7b1f9d1a2c3e4f5a',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user',
            },
            active: {
              type: 'boolean',
              example: true,
            },
            passwordChangedAt: {
              type: 'string',
              format: 'date-time',
            },
            passwordResetToken: {
              type: 'string',
            },
            passwordResetExpires: {
              type: 'string',
              format: 'date-time',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
