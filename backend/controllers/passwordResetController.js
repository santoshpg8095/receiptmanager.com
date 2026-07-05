const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

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

        // Generate OTP
        const otp = generateOTP();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save OTP to user (select: false, so we use findOneAndUpdate to bypass select)
        await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            {
                resetPasswordOTP: otp,
                resetPasswordExpires: expires
            }
        );

        // Send OTP via email using Resend
        const emailContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; border: 2px dashed #2563eb; }
                    .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; }
                    .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
                    .warning { color: #dc2626; font-size: 14px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${user.name || 'User'},</p>
                        <p>You requested to reset your password for your PG Receipt App account.</p>
                        
                        <div class="otp-box">
                            <p style="margin-bottom: 10px; font-size: 16px;">Your One-Time Password (OTP) is:</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin-top: 10px; font-size: 14px; color: #64748b;">This OTP is valid for 15 minutes</p>
                        </div>
                        
                        <p>To reset your password:</p>
                        <ol>
                            <li>Enter this OTP on the verification page</li>
                            <li>Set your new password</li>
                            <li>Login with your new credentials</li>
                        </ol>
                        
                        <p class="warning">⚠️ If you didn't request this, please ignore this email or contact support immediately.</p>
                        
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
                        <p style="font-size: 14px; color: #64748b;">
                            This is an automated message from PG Receipt App. Please do not reply to this email.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} PG Receipt App. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PG Receipt App <noreply@yourdomain.com>',
            to: user.email,
            subject: 'Password Reset OTP - PG Receipt App',
            html: emailContent,
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
            email: user.email
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending OTP. Please try again.',
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

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset fields
        user.password = hashedPassword;
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