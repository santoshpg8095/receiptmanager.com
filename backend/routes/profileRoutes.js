const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    exportUserData,
    enableTwoFactor,
    disableTwoFactor,
    deleteAccount
} = require('../controllers/profileController');

// All routes are protected
router.get('/export', protect, exportUserData);
router.post('/enable-2fa', protect, enableTwoFactor);
router.post('/disable-2fa', protect, disableTwoFactor);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;