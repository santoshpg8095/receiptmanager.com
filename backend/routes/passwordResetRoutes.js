const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

// Public routes (no authentication required)
router.post('/request-reset', passwordResetController.requestPasswordReset);
router.post('/verify-otp', passwordResetController.verifyOTP);
router.post('/reset-password', passwordResetController.resetPassword);

module.exports = router;