const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getProfile, 
    updateProfile, 
    getUsers, 
    updateUserRole 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', register);
router.post('/login', loginLimiter, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin only routes
router.get('/users', protect, roleCheck('admin'), getUsers);
router.put('/users/:id/role', protect, roleCheck('admin'), updateUserRole);

module.exports = router;