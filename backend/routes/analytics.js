const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin requirement to all routes
router.use(authenticate);
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', analyticsController.getDashboardStats);

// Product analytics
router.get('/products', analyticsController.getProductAnalytics);

module.exports = router;