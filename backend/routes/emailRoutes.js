const express = require('express');
const router = express.Router();
const {
  sendReceiptEmail,
  sendBulkReceipts,
  getEmailStatus
} = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

// ----------------------
// Test Resend Email Setup
// ----------------------
router.get('/test', protect, async (req, res) => {
  try {
    const resendConfigured = !!process.env.RESEND_API_KEY;

    if (!resendConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Resend API key not configured. Please set RESEND_API_KEY in your environment variables.'
      });
    }

    res.json({
      success: true,
      message: 'Email endpoint is working with Resend API',
      resendConfigured
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
});

// ----------------------
// Send single receipt
// ----------------------
router.post('/send', protect, sendReceiptEmail);

// ----------------------
// Send bulk receipts
// ----------------------
router.post('/bulk', protect, sendBulkReceipts);

// ----------------------
// Get email status for a receipt
// ----------------------
router.get('/status/:receiptId', protect, getEmailStatus);

// ----------------------
// Get email statistics
// ----------------------
router.get('/stats', protect, async (req, res) => {
  try {
    const Receipt = require('../models/Receipt');

    const totalReceipts = await Receipt.countDocuments({ user: req.user.id });
    const emailedReceipts = await Receipt.countDocuments({ 
      user: req.user.id, 
      sentViaEmail: true 
    });
    const pendingEmails = await Receipt.countDocuments({ 
      user: req.user.id, 
      sentViaEmail: false,
      tenantEmail: { $exists: true, $ne: '' }
    });

    res.json({
      success: true,
      stats: {
        totalReceipts,
        emailedReceipts,
        pendingEmails
      }
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: error.message
    });
  }
});

module.exports = router;
