const express = require('express');
const router = express.Router();
const { healthCheck } = require('../controllers/healthCheckController');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', healthCheck);

module.exports = router;
