const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');

// Initialize Resend (same as emailController)
let resendClient;
const getResendClient = () => {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is required');
        }
        resendClient = new Resend(apiKey);
        console.log('✅ Resend client initialized for password reset');
    }
    return resendClient;
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request OTP for password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save OTP to user
        await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
                resetPasswordOTP: otp,
                resetPasswordExpires: expires
            }
        );

        // Determine sender email - using the same config as emailController
        const senderDomain = process.env.RESEND_VERIFIED_DOMAIN;
        const senderEmail = process.env.RESEND_FROM_EMAIL;
        
        if (!senderDomain && !senderEmail) {
            throw new Error('Either RESEND_VERIFIED_DOMAIN or RESEND_FROM_EMAIL environment variable must be set');
        }
        
        // Construct from address - same as emailController
        let fromAddress;
        if (senderDomain) {
            fromAddress = `PG Receipt App <no-reply@${senderDomain}>`;
        } else {
            fromAddress = `"PG Receipt App" <${senderEmail}>`;
        }

        // Send OTP via email using Resend
        const emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset OTP</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f7fc;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #2563eb, #1d4ed8);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                        border-radius: 12px 12px 0 0;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    .content {
                        padding: 30px 20px;
                    }
                    .otp-box {
                        background: #f0f7ff;
                        padding: 25px;
                        text-align: center;
                        border-radius: 12px;
                        margin: 20px 0;
                        border: 2px dashed #2563eb;
                    }
                    .otp-code {
                        font-size: 40px;
                        font-weight: bold;
                        color: #2563eb;
                        letter-spacing: 10px;
                        font-family: 'Courier New', monospace;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #64748b;
                        font-size: 14px;
                        border-top: 1px solid #e2e8f0;
                    }
                    .warning {
                        color: #dc2626;
                        font-size: 14px;
                        margin-top: 15px;
                        padding: 10px;
                        background-color: #fee2e2;
                        border-radius: 8px;
                    }
                    .text-muted {
                        color: #64748b;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px;">Hello <strong>${user.name || 'User'}</strong>,</p>
                        <p>We received a request to reset your password for your <strong>PG Receipt App</strong> account.</p>
                        
                        <div class="otp-box">
                            <p style="margin-bottom: 10px; font-size: 16px; color: #1e293b;">Your One-Time Password (OTP) is:</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin-top: 15px; font-size: 14px; color: #64748b;">
                                ⏰ This OTP is valid for <strong>15 minutes</strong>
                            </p>
                        </div>
                        
                        <p style="margin-top: 20px;">To reset your password:</p>
                        <ol style="color: #1e293b; padding-left: 20px;">
                            <li>Enter this 6-digit OTP on the verification page</li>
                            <li>Choose a strong new password</li>
                            <li>Login with your new credentials</li>
                        </ol>
                        
                        <div class="warning">
                            ⚠️ If you didn't request this password reset, please ignore this email or 
                            <a href="mailto:support@pgreceipt.com" style="color: #dc2626; font-weight: 500;">contact support</a> immediately.
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
                        <p style="font-size: 14px; color: #64748b; text-align: center;">
                            This is an automated message from PG Receipt App.<br>
                            Please do not reply to this email.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} PG Receipt App. All rights reserved.</p>
                        <p class="text-muted">Made with ❤️ for PG Owners</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const resend = getResendClient();
        
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: user.email,
            subject: '🔐 Password Reset OTP - PG Receipt App',
            html: emailContent,
        });

        if (error) {
            console.error('Resend error:', error);
            throw new Error(`Resend error: ${error.message}`);
        }

        console.log('✅ Password reset OTP sent to:', user.email, 'Message ID:', data.id);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            email: user.email
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending OTP. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordOTP');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            email: user.email
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Reset password with OTP
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordOTP');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Hash new password (pre-save hook will handle this automatically)
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};