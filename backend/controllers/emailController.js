const { Resend } = require('resend');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { generateReceiptPDF } = require('../utils/pdfGenerator');
const AuditLog = require('../models/AuditLog');

// Initialize Resend
let resendClient;
const getResendClient = () => {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is required');
        }
        resendClient = new Resend(apiKey);
        console.log('✅ Resend client initialized');
    }
    return resendClient;
};

// Validate email address
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const generateProfessionalEmailHTML = (receipt, user, customMessage = null) => {
    const currentYear = new Date().getFullYear();
    const paymentDate = new Date(receipt.createdAt);
    const formattedDate = paymentDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const breakdownItems = [];
    if (receipt.amount > 0) breakdownItems.push({ description: 'Monthly Rent', amount: receipt.amount });
    if (receipt.securityDeposit > 0) breakdownItems.push({ description: 'Security Deposit', amount: receipt.securityDeposit });
    if (receipt.electricityCharges > 0) breakdownItems.push({ description: 'Electricity Charges', amount: receipt.electricityCharges });
    if (receipt.waterCharges > 0) breakdownItems.push({ description: 'Water Charges', amount: receipt.waterCharges });
    if (receipt.otherCharges > 0) breakdownItems.push({ description: 'Other Charges', amount: receipt.otherCharges });

    const breakdownRows = breakdownItems.map(item => `
        <tr>
            <td style="padding:10px 0; border-bottom:1px solid #eeeeee; color:#444444; font-size:14px;">${item.description}</td>
            <td style="padding:10px 0; border-bottom:1px solid #eeeeee; color:#111111; font-weight:bold; text-align:right; font-size:14px;">₹${item.amount.toLocaleString('en-IN')}</td>
        </tr>
    `).join('');

    // PG Rules formatted for mobile readability
    const pgRulesList = [
        "Valid government ID is mandatory.",
        "Rent/Deposit must be paid before occupation.",
        "Rent is strictly non-refundable.",
        "30-day prior notice required before vacating.",
        "Full month rent charge if 30-day notice is missed.",
        "Entry must be before 10:30 PM.",
        "Guests and overnight stays are not allowed.",
        "Maintain cleanliness; damages will be charged.",
        "No extra electrical appliances allowed.",
        "Management reserves all rights for rule changes."
    ].map(rule => `
        <div style="padding:4px 0; font-size:12px; color:#475569; border-bottom:1px solid #f1f5f9;">
            <span style="color:#f97316; font-weight:bold; margin-right:5px;">•</span> ${rule}
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Payment Receipt</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f7f9;">
        <tr>
            <td align="center" style="padding: 15px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    
                    <tr>
                        <td align="center" style="background-color:#1e3a8a; padding: 35px 20px;">
                            <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:bold;">${user.pgName}</h1>
                            <div style="display:inline-block; margin-top:15px; padding:6px 15px; background-color:rgba(255,255,255,0.15); border-radius:20px; color:#ffffff; font-size:12px; font-weight:bold; text-transform:uppercase;">Official Receipt</div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 25px 25px 0;">
                            <p style="margin:0; font-size:18px; color:#1e293b; font-weight:bold;">Hello ${receipt.tenantName},</p>
                            <p style="margin:8px 0 0; color:#64748b; font-size:14px; line-height:1.5;">Payment received for <b>${receipt.forMonth}</b>.</p>
                            ${customMessage ? `
                                <div style="margin-top:15px; padding:12px; background-color:#eff6ff; border-left:4px solid #3b82f6; border-radius:4px; font-size:13px; color:#1e40af;">
                                    <b>Note:</b> ${customMessage}
                                </div>
                            ` : ''}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 20px 25px; text-align:center; font-size:0;">
                            <div style="display:inline-block; width:100%; max-width:260px; vertical-align:top; font-size:14px; text-align:left;">
                                <div style="margin:5px; background-color:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                                    <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Receipt Number</div>
                                    <div style="font-weight:bold; color:#1e3a8a;">#${receipt.receiptNumber}</div>
                                </div>
                            </div>
                            <div style="display:inline-block; width:100%; max-width:260px; vertical-align:top; font-size:14px; text-align:left;">
                                <div style="margin:5px; background-color:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
                                    <div style="font-size:11px; color:#94a3b8; text-transform:uppercase;">Date Paid</div>
                                    <div style="font-weight:bold; color:#1e3a8a;">${formattedDate}</div>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 25px 25px;">
                            <div style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; text-align:center;">
                                <span style="display:block; font-size:12px; color:#166534; font-weight:bold; margin-bottom:4px;">TOTAL AMOUNT PAID</span>
                                <span style="font-size:32px; color:#15803d; font-weight:bold;">₹${receipt.amountPaid.toLocaleString('en-IN')}</span>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 25px 20px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                ${breakdownRows}
                                <tr>
                                    <td style="padding:15px 0; font-weight:bold; color:#111111; font-size:15px;">Grand Total Due</td>
                                    <td style="padding:15px 0; font-weight:bold; color:#1e3a8a; text-align:right; font-size:15px;">₹${receipt.totalAmount.toLocaleString('en-IN')}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 0 25px 30px;">
                            <div style="background-color:#fffbf0; padding:20px; border-radius:12px; border:1px solid #fde68a;">
                                <div style="font-size:14px; color:#92400e; font-weight:bold; margin-bottom:12px; border-bottom:1px solid #fef3c7; padding-bottom:8px;">📜 PG Rules & Regulations</div>
                                ${pgRulesList}
                                <div style="margin-top:12px; font-size:11px; color:#b45309; text-align:center; font-style:italic;">By staying, residents agree to follow all the above rules.</div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color:#f8fafc; padding:20px; text-align:center; border-top:1px solid #eeeeee;">
                            <p style="margin:0; font-size:12px; color:#94a3b8;">&copy; ${currentYear} <b>${user.pgName}</b>. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

// Helper function to send email via Resend
const sendEmailViaResend = async (mailOptions) => {
    const resend = getResendClient();
    
    // Convert nodemailer-style options to Resend format
    const resendOptions = {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        attachments: mailOptions.attachments?.map(attachment => ({
            filename: attachment.filename,
            content: attachment.content.toString('base64'),
            contentType: attachment.contentType
        })) || [],
        headers: mailOptions.headers
    };
    
    const { data, error } = await resend.emails.send(resendOptions);
    
    if (error) {
        throw new Error(`Resend error: ${error.message}`);
    }
    
    return {
        messageId: data.id,
        response: data
    };
};

// @desc    Send receipt via email using Resend
// @route   POST /api/email/send
// @access  Private
const sendReceiptEmail = async (req, res) => {
    try {
        const { receiptId, recipientEmail, subject, customMessage } = req.body;
        
        console.log('📧 Email sending request received (Resend):', { receiptId, recipientEmail });
        
        // Validate input
        if (!receiptId) {
            return res.status(400).json({ 
                success: false,
                message: 'Receipt ID is required' 
            });
        }
        
        // Get receipt
        const receipt = await Receipt.findOne({
            _id: receiptId,
            user: req.user.id
        });
        
        if (!receipt) {
            return res.status(404).json({ 
                success: false,
                message: 'Receipt not found or access denied' 
            });
        }
        
        // Determine recipient email
        const emailToSend = recipientEmail || receipt.tenantEmail;
        
        if (!emailToSend) {
            return res.status(400).json({ 
                success: false,
                message: 'No email address specified and receipt has no tenant email' 
            });
        }
        
        if (!isValidEmail(emailToSend)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid email address format' 
            });
        }
        
        // Get user details
        const user = await User.findById(req.user.id).select('pgName pgAddress pgContact email emailSignature pgTagline');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('📄 Generating PDF for receipt:', receipt.receiptNumber);
        
        // Generate PDF (QR code removed from PDF generator)
        const pdfBuffer = await generateReceiptPDF(receipt, user, null);
        
        // Determine sender email - using Resend verified domain or email
        const senderDomain = process.env.RESEND_VERIFIED_DOMAIN;
        const senderEmail = process.env.RESEND_FROM_EMAIL;
        
        if (!senderDomain && !senderEmail) {
            throw new Error('Either RESEND_VERIFIED_DOMAIN or RESEND_FROM_EMAIL environment variable must be set');
        }
        
        // Construct from address
        let fromAddress;
        if (senderDomain) {
            fromAddress = `${user.pgName} <no-reply@${senderDomain}>`;
        } else {
            fromAddress = `"${user.pgName}" <${senderEmail}>`;
        }
        
        // Prepare email content
        const emailSubject = subject || `Payment Receipt ${receipt.receiptNumber} - ${user.pgName}`;
        
        const plainText = 
            `Dear ${receipt.tenantName},\n\n` +
            `Thank you for your payment for ${receipt.forMonth}.\n\n` +
            `PAYMENT RECEIPT #${receipt.receiptNumber}\n` +
            `========================================\n` +
            `Amount: ₹${receipt.amountPaid}\n` +
            `Date: ${new Date(receipt.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })}\n` +
            `Payment Mode: ${receipt.paymentMode}\n` +
            `For Month: ${receipt.forMonth}\n` +
            `Room No: ${receipt.roomNumber}\n\n` +
            `A detailed PDF receipt is attached to this email.\n\n` +
            `Best regards,\n` +
            `${user.pgName}\n` +
            `${user.emailSignature || ''}\n\n` +
            `This is an automated email. Please do not reply directly.`;
        
        // Generate professional HTML with inline CSS
        const emailHtml = generateProfessionalEmailHTML(receipt, user, customMessage);
        
        console.log('📤 Preparing to send email via Resend to:', emailToSend);
        
        // Prepare email options for Resend
        const mailOptions = {
            from: fromAddress,
            to: emailToSend,
            subject: emailSubject,
            text: plainText,
            html: emailHtml,
            attachments: [{
                filename: `receipt-${receipt.receiptNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }],
            headers: {
                'X-Receipt-ID': receiptId,
                'X-User-ID': req.user.id,
                'X-PG-Name': user.pgName.replace(/\s+/g, '-')
            }
        };
        
        console.log('🚀 Sending email via Resend...');
        const info = await sendEmailViaResend(mailOptions);
        console.log('✅ Email sent successfully via Resend:', info.messageId);
        
        // Update receipt
        receipt.sentViaEmail = true;
        receipt.emailSentAt = new Date();
        receipt.emailMessageId = info.messageId;
        receipt.lastEmailSentTo = emailToSend;
        await receipt.save();
        
        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'email_sent',
            details: { 
                receiptId: receipt._id, 
                receiptNumber: receipt.receiptNumber,
                recipientEmail: emailToSend,
                messageId: info.messageId,
                subject: emailSubject,
                provider: 'resend'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({ 
            success: true,
            message: 'Receipt sent via email successfully',
            data: {
                sentTo: emailToSend,
                messageId: info.messageId,
                receiptNumber: receipt.receiptNumber,
                timestamp: new Date().toISOString(),
                provider: 'resend'
            }
        });
        
    } catch (error) {
        console.error('❌ Resend email error:', error.message);
        
        let errorMessage = 'Failed to send email';
        let statusCode = 500;
        
        if (error.message.includes('RESEND_API_KEY')) {
            errorMessage = 'Resend API key is not configured. Please set RESEND_API_KEY environment variable.';
            statusCode = 500;
        } else if (error.message.includes('verified domain')) {
            errorMessage = 'Email sending domain is not verified in Resend. Please verify your domain or use a verified email address.';
            statusCode = 400;
        } else if (error.message.includes('authentication')) {
            errorMessage = 'Resend authentication failed. Please check your API key.';
            statusCode = 401;
        }
        
        res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Send bulk receipts using Resend
// @route   POST /api/email/bulk
// @access  Private
const sendBulkReceipts = async (req, res) => {
    try {
        const { receiptIds, customMessage } = req.body;
        
        console.log('📧 Bulk email request received for', receiptIds?.length, 'receipts (Resend)');
        
        // Validate input
        if (!receiptIds || !Array.isArray(receiptIds) || receiptIds.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a non-empty array of receipt IDs' 
            });
        }
        
        if (receiptIds.length > 50) {
            return res.status(400).json({ 
                success: false,
                message: 'Maximum 50 receipts can be sent at once' 
            });
        }
        
        const results = [];
        const errors = [];
        
        // Get user details
        const user = await User.findById(req.user.id).select('pgName pgAddress pgContact email emailSignature pgTagline');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Determine sender email
        const senderDomain = process.env.RESEND_VERIFIED_DOMAIN;
        const senderEmail = process.env.RESEND_FROM_EMAIL;
        
        if (!senderDomain && !senderEmail) {
            return res.status(500).json({
                success: false,
                message: 'Either RESEND_VERIFIED_DOMAIN or RESEND_FROM_EMAIL environment variable must be set'
            });
        }
        
        let fromAddress;
        if (senderDomain) {
            fromAddress = `${user.pgName} <no-reply@${senderDomain}>`;
        } else {
            fromAddress = `"${user.pgName}" <${senderEmail}>`;
        }
        
        // Process receipts sequentially
        for (const receiptId of receiptIds) {
            try {
                const receipt = await Receipt.findOne({
                    _id: receiptId,
                    user: req.user.id
                });
                
                if (!receipt) {
                    errors.push({ receiptId, error: 'Receipt not found or access denied' });
                    continue;
                }
                
                if (!receipt.tenantEmail) {
                    errors.push({ 
                        receiptId, 
                        receiptNumber: receipt.receiptNumber,
                        error: 'No email address for tenant' 
                    });
                    continue;
                }
                
                if (!isValidEmail(receipt.tenantEmail)) {
                    errors.push({ 
                        receiptId, 
                        receiptNumber: receipt.receiptNumber,
                        error: 'Invalid email address format' 
                    });
                    continue;
                }
                
                // Check if email was recently sent (30 minutes cooldown)
                const timeSinceLastEmail = receipt.emailSentAt 
                    ? Date.now() - new Date(receipt.emailSentAt).getTime()
                    : Infinity;
                    
                if (timeSinceLastEmail < 30 * 60 * 1000) {
                    errors.push({
                        receiptId,
                        receiptNumber: receipt.receiptNumber,
                        error: 'Email was sent recently, skipping to prevent duplicates',
                        status: 'skipped'
                    });
                    continue;
                }
                
                // Generate PDF (no QR code)
                const pdfBuffer = await generateReceiptPDF(receipt, user, null);
                
                // Generate HTML with inline CSS
                const emailHtml = generateProfessionalEmailHTML(receipt, user, customMessage);
                
                // Prepare plain text
                const plainText = `Payment receipt #${receipt.receiptNumber} is attached. Please view the HTML version for complete details.`;
                
                // Send email via Resend
                const mailOptions = {
                    from: fromAddress,
                    to: receipt.tenantEmail,
                    subject: `Payment Receipt ${receipt.receiptNumber} - ${user.pgName}`,
                    text: plainText,
                    html: emailHtml,
                    attachments: [{
                        filename: `receipt-${receipt.receiptNumber}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                };
                
                const info = await sendEmailViaResend(mailOptions);
                
                // Update receipt
                receipt.sentViaEmail = true;
                receipt.emailSentAt = new Date();
                receipt.emailMessageId = info.messageId;
                receipt.lastEmailSentTo = receipt.tenantEmail;
                await receipt.save();
                
                // Log action
                await AuditLog.create({
                    user: req.user.id,
                    action: 'email_sent_bulk',
                    details: { 
                        receiptId: receipt._id, 
                        receiptNumber: receipt.receiptNumber,
                        recipientEmail: receipt.tenantEmail,
                        messageId: info.messageId,
                        provider: 'resend'
                    },
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });
                
                results.push({
                    receiptId,
                    receiptNumber: receipt.receiptNumber,
                    tenantEmail: receipt.tenantEmail,
                    tenantName: receipt.tenantName,
                    amount: receipt.amountPaid,
                    status: 'sent',
                    messageId: info.messageId,
                    timestamp: new Date().toISOString(),
                    provider: 'resend'
                });
                
                // Small delay between emails to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                errors.push({
                    receiptId,
                    error: error.message
                });
            }
        }
        
        // Log bulk operation summary
        await AuditLog.create({
            user: req.user.id,
            action: 'bulk_email_completed',
            details: { 
                total: receiptIds.length,
                sent: results.length,
                failed: errors.filter(e => e.status !== 'skipped').length,
                skipped: errors.filter(e => e.status === 'skipped').length,
                provider: 'resend'
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        const totalAmount = results.reduce((sum, r) => sum + (r.amount || 0), 0);
        
        console.log(`✅ Bulk email via Resend completed: ${results.length} sent, ${errors.length} failed/skipped`);
        
        res.json({
            success: true,
            message: `Bulk email sending completed successfully`,
            data: {
                summary: {
                    total: receiptIds.length,
                    sent: results.length,
                    failed: errors.filter(e => e.status !== 'skipped').length,
                    skipped: errors.filter(e => e.status === 'skipped').length,
                    totalAmount: totalAmount,
                    successRate: ((results.length / receiptIds.length) * 100).toFixed(1) + '%',
                    provider: 'resend'
                },
                results: results.sort((a, b) => a.receiptNumber.localeCompare(b.receiptNumber)),
                errors: errors.sort((a, b) => (a.receiptNumber || a.receiptId).localeCompare(b.receiptNumber || b.receiptId))
            }
        });
        
    } catch (error) {
        console.error('❌ Bulk email error (Resend):', error.message);
        
        res.status(500).json({ 
            success: false,
            message: 'Failed to process bulk email request',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get email sending status
// @route   GET /api/email/status/:receiptId
// @access  Private
const getEmailStatus = async (req, res) => {
    try {
        const { receiptId } = req.params;
        
        const receipt = await Receipt.findOne({
            _id: receiptId,
            user: req.user.id
        });
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }
        
        const emailLogs = await AuditLog.find({
            user: req.user.id,
            'details.receiptId': receiptId,
            action: { $in: ['email_sent', 'email_sent_bulk'] }
        })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('timestamp action details.ipAddress details.recipientEmail details.messageId details.provider');
        
        res.json({
            success: true,
            data: {
                receiptId,
                receiptNumber: receipt.receiptNumber,
                emailStatus: {
                    sentViaEmail: receipt.sentViaEmail,
                    emailSentAt: receipt.emailSentAt,
                    lastEmailSentTo: receipt.lastEmailSentTo,
                    emailMessageId: receipt.emailMessageId,
                    totalEmailsSent: emailLogs.length
                },
                tenantInfo: {
                    name: receipt.tenantName,
                    email: receipt.tenantEmail,
                    roomNumber: receipt.roomNumber
                },
                emailHistory: emailLogs.map(log => ({
                    timestamp: log.timestamp,
                    action: log.action,
                    recipientEmail: log.details.recipientEmail,
                    messageId: log.details.messageId,
                    ipAddress: log.details.ipAddress,
                    provider: log.details.provider || 'unknown'
                }))
            }
        });
        
    } catch (error) {
        console.error('❌ Get email status error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get email status'
        });
    }
};

module.exports = {
    sendReceiptEmail,
    sendBulkReceipts,
    getEmailStatus
};