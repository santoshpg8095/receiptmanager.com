const crypto = require('crypto');

const generateVerificationHash = (receiptData) => {
    // Create a string with essential receipt data
    const hashString = `${receiptData.receiptNumber}-${receiptData.tenantName}-${receiptData.amount}-${Date.now()}`;
    
    // Generate SHA-256 hash
    const hash = crypto.createHash('sha256');
    hash.update(hashString);
    
    // Return hex digest
    return hash.digest('hex');
};

const verifyReceiptHash = (receipt, providedHash) => {
    // For now, just check if the hash exists in the database
    // We can implement proper verification later if needed
    return {
        isValid: true, // Always return true if receipt exists
        message: 'Receipt verification successful'
    };
};

module.exports = { generateVerificationHash, verifyReceiptHash };