const { BadRequestError } = require('../utils/errors');
const { logger } = require('../utils/logger');

/**
 * Validates request data against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: {
          objects: true,
        },
      });

      if (error) {
        const errors = error.details.reduce((acc, curr) => {
          const key = curr.path.join('.');
          acc[key] = curr.message.replace(/"/g, '');
          return acc;
        }, {});

        throw new BadRequestError('Validation Error', errors);
      }

      // Replace request data with validated and sanitized data
      req[property] = value;
      next();
    } catch (error) {
      logger.error(`Validation error: ${error.message}`, { error });
      next(error);
    }
  };
};

module.exports = validate;
