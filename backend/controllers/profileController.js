const User = require('../models/User');
const Receipt = require('../models/Receipt');
const AuditLog = require('../models/AuditLog');
const { Parser } = require('json2csv');

// @desc    Export user data as CSV
// @route   GET /api/profile/export
// @access  Private
const exportUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get all receipts for the user
        const receipts = await Receipt.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-qrCode -verificationHash -__v');

        // Prepare CSV data
        const receiptData = receipts.map(receipt => ({
            'Receipt Number': receipt.receiptNumber,
            'Date': new Date(receipt.createdAt).toLocaleDateString('en-IN'),
            'Tenant Name': receipt.tenantName,
            'Tenant Email': receipt.tenantEmail || '',
            'Tenant Phone': receipt.tenantPhone,
            'Room Number': receipt.roomNumber,
            'For Month': receipt.forMonth,
            'Amount (₹)': receipt.amount,
            'Security Deposit (₹)': receipt.securityDeposit,
            'Electricity Charges (₹)': receipt.electricityCharges,
            'Water Charges (₹)': receipt.waterCharges,
            'Other Charges (₹)': receipt.otherCharges,
            'Total Amount (₹)': receipt.totalAmount,
            'Previous Balance (₹)': receipt.previousBalance,
            'Amount Paid (₹)': receipt.amountPaid,
            'Balance Due (₹)': receipt.balanceDue,
            'Payment Mode': receipt.paymentMode,
            'Transaction ID': receipt.transactionId || '',
            'Sent via Email': receipt.sentViaEmail ? 'Yes' : 'No',
            'Email Sent Date': receipt.emailSentAt ? new Date(receipt.emailSentAt).toLocaleDateString('en-IN') : '',
            'Verification Count': receipt.verificationCount,
            'Last Verified': receipt.lastVerifiedAt ? new Date(receipt.lastVerifiedAt).toLocaleDateString('en-IN') : '',
            'Notes': receipt.notes || ''
        }));

        // User data
        const userData = [{
            'User ID': user._id,
            'Name': user.name,
            'Email': user.email,
            'Role': user.role,
            'PG Name': user.pgName,
            'PG Address': user.pgAddress,
            'PG Contact': user.pgContact,
            'GSTIN': user.gstin || '',
            'Account Created': new Date(user.createdAt).toLocaleDateString('en-IN'),
            'Total Receipts': receipts.length,
            'Total Revenue (₹)': receipts.reduce((sum, receipt) => sum + receipt.amountPaid, 0)
        }];

        // Convert to CSV
        const json2csvParser = new Parser();
        const receiptsCSV = json2csvParser.parse(receiptData);
        const userCSV = json2csvParser.parse(userData);

        // Combine data
        const combinedCSV = `USER DATA\n${userCSV}\n\nRECEIPTS DATA\n${receiptsCSV}`;

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `pg-receipts-export-${user.email}-${timestamp}.csv`;

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Log export action (don't await to avoid blocking)
        AuditLog.create({
            user: req.user.id,
            action: 'data_export',
            details: { 
                filename,
                receiptCount: receipts.length 
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        }).catch(err => console.error('Audit log error:', err));

        // Send CSV data
        res.send(combinedCSV);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ 
            message: 'Failed to export data',
            error: error.message 
        });
    }
};

// @desc    Enable two-factor authentication
// @route   POST /api/profile/enable-2fa
// @access  Private
const enableTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // In a real app, you would generate a secret and QR code here
        // For now, we'll just set a flag
        user.twoFactorEnabled = true;
        user.twoFactorSecret = 'demo-secret-' + Date.now(); // Demo secret
        await user.save();

        // Generate QR code URL (demo)
        const qrCodeUrl = `otpauth://totp/PGReceipts:${user.email}?secret=${user.twoFactorSecret}&issuer=PGReceipts`;

        // Log action (don't await to avoid blocking)
        AuditLog.create({
            user: req.user.id,
            action: 'enable_2fa',
            details: { enabled: true },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        }).catch(err => console.error('Audit log error:', err));

        res.json({
            message: 'Two-factor authentication enabled',
            twoFactorEnabled: true,
            secret: user.twoFactorSecret,
            qrCodeUrl: qrCodeUrl,
            backupCodes: ['123456', '234567', '345678', '456789', '567890'] // Demo backup codes
        });

    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ 
            message: 'Failed to enable two-factor authentication',
            error: error.message 
        });
    }
};

// @desc    Disable two-factor authentication
// @route   POST /api/profile/disable-2fa
// @access  Private
const disableTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();

        // Log action (don't await to avoid blocking)
        AuditLog.create({
            user: req.user.id,
            action: 'disable_2fa',
            details: { enabled: false },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        }).catch(err => console.error('Audit log error:', err));

        res.json({
            message: 'Two-factor authentication disabled',
            twoFactorEnabled: false
        });

    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ 
            message: 'Failed to disable two-factor authentication',
            error: error.message 
        });
    }
};

// @desc    Delete user account PERMANENTLY
// @route   DELETE /api/profile/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        // Fetch user WITH password field
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if password is provided
        const password = req.body.password || req.query.password;
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required for account deletion' });
        }

        // Verify password
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Log action BEFORE deletion
        await AuditLog.create({
            user: req.user.id,
            action: 'delete_account',
            details: { 
                email: user.email,
                pgName: user.pgName,
                type: 'permanent'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Also delete all associated data
        
        // 1. Delete all receipts
        await Receipt.deleteMany({ user: req.user.id });
        
        // 2. Delete all audit logs for this user
        await AuditLog.deleteMany({ user: req.user.id });
        
        // 3. Delete the user account PERMANENTLY
        await user.deleteOne(); // or User.findByIdAndDelete(req.user.id)

        res.json({
            message: 'Account and all associated data permanently deleted',
            deleted: true
        });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            message: 'Failed to delete account',
            error: error.message 
        });
    }
};
module.exports = {
    exportUserData,
    enableTwoFactor,
    disableTwoFactor,
    deleteAccount
};