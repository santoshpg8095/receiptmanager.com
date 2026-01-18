const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getMonthlyAnalytics,
    getTenantStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/analytics', protect, getMonthlyAnalytics);
router.get('/tenants', protect, getTenantStats);

module.exports = router;