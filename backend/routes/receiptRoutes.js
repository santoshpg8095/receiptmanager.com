const express = require('express');
const router = express.Router();
const {
    createReceipt,
    getReceipts,
    getReceipt,
    updateReceipt,
    deleteReceipt,
    downloadReceipt,
    verifyReceipt
} = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const { receiptLimiter } = require('../middleware/rateLimiter');

// Public route (no auth needed)
router.get('/verify/:hash', verifyReceipt);

// Protected routes
router.post('/', protect, receiptLimiter, createReceipt);
router.get('/', protect, getReceipts);
router.get('/:id', protect, getReceipt);
router.put('/:id', protect, updateReceipt);
router.delete('/:id', protect, deleteReceipt);
router.get('/:id/download', protect, downloadReceipt);

module.exports = router;