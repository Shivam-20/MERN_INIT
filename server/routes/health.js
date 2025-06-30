const express = require('express');
const router = express.Router();

// Health check endpoint for Railway
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Encriptofy API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 