const QRCode = require('qrcode');

const generateQRCode = async (data) => {
    try {
        // Create verification URL
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${data.verificationHash}`;
        
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        return qrCodeDataUrl;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = { generateQRCode };