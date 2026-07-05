const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Public routes for OTP-based password reset
router.post('/send-otp', passwordResetController.sendOTP);
router.post('/verify-otp', passwordResetController.verifyOTP);
router.post('/reset-password', passwordResetController.resetPasswordWithOTP);

module.exports = router;