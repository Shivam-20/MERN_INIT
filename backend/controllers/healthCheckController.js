const { sendSuccess } = require('../utils/apiResponse');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
const healthCheck = (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  };
  
  sendSuccess(res, healthCheck, 'Server is running');
};

module.exports = {
  healthCheck,
};
