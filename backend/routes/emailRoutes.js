const express = require('express');
const router = express.Router();
const {
  sendReceiptEmail,
  sendBulkReceipts,
  getEmailStatus
} = require('../controllers/emailController'); // IMPORT THE REAL CONTROLLER
const { protect } = require('../middleware/authMiddleware');

// Test email connection
router.get('/test', protect, async (req, res) => {
  try {
    // Simple test endpoint
    res.json({ 
      success: true,
      message: 'Email endpoint is working',
      smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Email test failed',
      error: error.message 
    });
  }
});

// Send single receipt email
router.post('/send', protect, sendReceiptEmail);

// Send bulk emails
router.post('/bulk', protect, sendBulkReceipts);

// Get email status for a receipt
router.get('/status/:receiptId', protect, getEmailStatus);

// Get email statistics
router.get('/stats', protect, async (req, res) => {
  try {
    // Simple stats - you can enhance this later
    const Receipt = require('../models/Receipt');
    const stats = {
      totalReceipts: await Receipt.countDocuments({ user: req.user.id }),
      emailedReceipts: await Receipt.countDocuments({ 
        user: req.user.id, 
        sentViaEmail: true 
      }),
      pendingEmails: await Receipt.countDocuments({ 
        user: req.user.id, 
        sentViaEmail: false,
        tenantEmail: { $exists: true, $ne: '' }
      })
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics'
    });
  }
});

module.exports = router;