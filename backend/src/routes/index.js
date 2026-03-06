const express = require('express');
const router = express.Router();

const authRoutes = require('./v1/auth');
const taskRoutes = require('./v1/tasks');
const adminRoutes = require('./v1/admin');

// API v1
router.use('/v1/auth', authRoutes);
router.use('/v1/tasks', taskRoutes);
router.use('/v1/admin', adminRoutes);

// Version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Manager API',
    versions: { v1: '/api/v1' },
    docs: '/api/docs',
  });
});

module.exports = router;
