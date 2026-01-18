const nodemailer = require('nodemailer');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { generateReceiptPDF } = require('../utils/pdfGenerator');
const AuditLog = require('../models/AuditLog');

// Create reusable transporter with connection pooling
let transporter;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100
        });
        
        transporter.verify()
            .then(() => console.log('✅ SMTP connection verified'))
            .catch(err => console.error('❌ SMTP connection failed:', err));
    }
    return transporter;
};

// Validate email address
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Enhanced professional HTML email template
// Enhanced professional HTML email template
const generateProfessionalEmailHTML = (receipt, user, customMessage = null) => {
    const currentYear = new Date().getFullYear();
    const paymentDate = new Date(receipt.createdAt);
    const formattedDate = paymentDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Calculate breakdown items
    const breakdownItems = [];
    if (receipt.amount > 0) breakdownItems.push({ description: 'Monthly Rent', amount: receipt.amount });
    if (receipt.securityDeposit > 0) breakdownItems.push({ description: 'Security Deposit', amount: receipt.securityDeposit });
    if (receipt.electricityCharges > 0) breakdownItems.push({ description: 'Electricity Charges', amount: receipt.electricityCharges });
    if (receipt.waterCharges > 0) breakdownItems.push({ description: 'Water Charges', amount: receipt.waterCharges });
    if (receipt.otherCharges > 0) breakdownItems.push({ description: 'Other Charges', amount: receipt.otherCharges });
    
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Receipt ${receipt.receiptNumber} - ${user.pgName}</title>
            <style>
                /* Reset & Base Styles */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    line-height: 1.6;
                    color: #2d3748;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 40px 20px;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                /* Modern Container */
                .email-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
                
                /* Premium Header */
                .email-header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                    color: white;
                    padding: 50px 40px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .header-overlay {
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 100%;
                    height: 200%;
                    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 70%);
                    opacity: 0.5;
                }
                
                .logo-container {
                    position: relative;
                    z-index: 2;
                    margin-bottom: 30px;
                }
                
                .pg-logo {
                    font-size: 42px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                    background: linear-gradient(to right, #ffffff, #e2e8f0);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .receipt-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    padding: 15px 40px;
                    border-radius: 50px;
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                /* Main Content */
                .email-content {
                    padding: 50px 40px;
                    background: #f8fafc;
                }
                
                /* Greeting Section */
                .greeting-section {
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    margin-bottom: 30px;
                    border-left: 6px solid #3b82f6;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                
                .greeting-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .greeting-text {
                    color: #64748b;
                    line-height: 1.8;
                    font-size: 16px;
                }
                
                /* Receipt Card */
                .receipt-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    margin-bottom: 40px;
                    border: 2px solid #e2e8f0;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                    position: relative;
                    overflow: hidden;
                }
                
                .receipt-watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 120px;
                    font-weight: 900;
                    color: rgba(30, 58, 138, 0.03);
                    white-space: nowrap;
                    user-select: none;
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px dashed #e2e8f0;
                    position: relative;
                    z-index: 1;
                }
                
                .card-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                }
                
                .status-badge {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 50px;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                }
                
                /* Amount Display */
                .amount-display {
                    text-align: center;
                    margin: 40px 0;
                    padding: 40px;
                    background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
                    border-radius: 20px;
                    border: 3px solid #3b82f6;
                    position: relative;
                    z-index: 1;
                }
                
                .amount-label {
                    font-size: 16px;
                    color: #1e40af;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 10px;
                    font-weight: 600;
                }
                
                .amount-value {
                    font-size: 48px;
                    font-weight: 800;
                    color: #1e3a8a;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                /* Details Grid */
                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                    position: relative;
                    z-index: 1;
                }
                
                .detail-item {
                    background: #f8fafc;
                    padding: 20px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    transition: all 0.3s ease;
                }
                
                .detail-item:hover {
                    transform: translateY(-5px);
                    border-color: #3b82f6;
                    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.1);
                }
                
                .detail-label {
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                
                .detail-value {
                    font-size: 18px;
                    color: #1e293b;
                    font-weight: 600;
                }
                
                /* Breakdown Table */
                .breakdown-section {
                    margin: 40px 0;
                    position: relative;
                    z-index: 1;
                }
                
                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .breakdown-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
                }
                
                .breakdown-table th {
                    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                    padding: 18px;
                    text-align: left;
                    font-weight: 700;
                    color: #334155;
                    border-bottom: 2px solid #cbd5e1;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .breakdown-table td {
                    padding: 18px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #475569;
                    font-size: 15px;
                }
                
                .breakdown-table tr:last-child td {
                    border-bottom: none;
                    font-weight: 700;
                    color: #1e293b;
                    background: #f8fafc;
                }
                
                .breakdown-table tr:hover td {
                    background: #f1f5f9;
                }
                
                .amount-cell {
                    font-weight: 700;
                    color: #059669;
                    text-align: right;
                }
                
                /* Rules & Regulations */
                .rules-section {
                    background: linear-gradient(135deg, #fff7ed, #ffedd5);
                    border-radius: 20px;
                    padding: 30px;
                    margin: 40px 0;
                    border: 2px solid #fb923c;
                    position: relative;
                    z-index: 1;
                }
                
                .rules-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 25px;
                }
                
                .rules-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #9a3412;
                }
                
                .rules-list {
                    margin-bottom: 20px;
                }
                
                .rule-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    color: #7c2d12;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 12px;
                }
                
                .rule-number {
                    font-weight: bold;
                    color: #ea580c;
                    min-width: 25px;
                }
                
                .rule-text {
                    flex: 1;
                }
                
                .rule-text strong {
                    color: #9a3412;
                }
                
                .agreement-text {
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px dashed #fb923c;
                    font-weight: 700;
                    color: #9a3412;
                    font-size: 15px;
                }
                
                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .receipt-card, .greeting-section, .rules-section {
                    animation: fadeIn 0.6s ease-out;
                }
                
                /* Responsive Design */
                @media (max-width: 768px) {
                    body {
                        padding: 20px 10px;
                    }
                    
                    .email-header, .email-content {
                        padding: 30px 20px;
                    }
                    
                    .pg-logo {
                        font-size: 32px;
                    }
                    
                    .receipt-badge {
                        font-size: 16px;
                        padding: 12px 30px;
                    }
                    
                    .amount-value {
                        font-size: 36px;
                    }
                    
                    .details-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .card-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <!-- Header -->
                <div class="email-header">
                    <div class="header-overlay"></div>
                    <div class="logo-container">
                        <h1 class="pg-logo">${user.pgName}</h1>
                    </div>
                    <div class="receipt-badge">OFFICIAL PAYMENT RECEIPT</div>
                </div>
                
                <!-- Content -->
                <div class="email-content">
                    <!-- Greeting -->
                    <div class="greeting-section">
                        <h2 class="greeting-title">
                            <span style="font-size: 24px;">👋</span> 
                            Dear ${receipt.tenantName},
                        </h2>
                        <p class="greeting-text">
                            Thank you for your prompt payment. We have successfully processed your payment for 
                            <strong style="color: #1e40af;">${receipt.forMonth}</strong>. This receipt serves as official confirmation of your payment.
                        </p>
                        ${customMessage ? `
                            <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                                <strong>📝 Note from Management:</strong>
                                <p style="color: #0369a1; margin-top: 5px;">${customMessage}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Receipt Card -->
                    <div class="receipt-card">
                              
                        <div class="card-header">
                            <h3 class="card-title">PAYMENT SUMMARY</h3>
                            <div class="status-badge">PAID & CONFIRMED</div>
                        </div>
                        
                        <!-- Amount Display -->
                        <div class="amount-display">
                            <div class="amount-label">Total Amount Paid</div>
                            <div class="amount-value">₹${receipt.amountPaid.toLocaleString('en-IN')}</div>
                        </div>
                        
                        <!-- Details Grid -->
                        <div class="details-grid">
                            <div class="detail-item">
                                <div class="detail-label">Receipt Number</div>
                                <div class="detail-value">#${receipt.receiptNumber}</div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-label">Payment Date</div>
                                <div class="detail-value">${formattedDate}</div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-label">Payment Method</div>
                                <div class="detail-value">${receipt.paymentMode.toUpperCase()}</div>
                            </div>
                            
                            <div class="detail-item">
                                <div class="detail-label">Room Number</div>
                                <div class="detail-value">${receipt.roomNumber}</div>
                            </div>
                        </div>
                        
                        <!-- Breakdown Section -->
                        <div class="breakdown-section">
                            <div class="section-title">
                                <span>📊</span> Payment Breakdown
                            </div>
                            
                            ${breakdownItems.length > 0 ? `
                                <table class="breakdown-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${breakdownItems.map(item => `
                                            <tr>
                                                <td>${item.description}</td>
                                                <td class="amount-cell">₹${item.amount.toLocaleString('en-IN')}</td>
                                            </tr>
                                        `).join('')}
                                        <tr>
                                            <td><strong>GRAND TOTAL</strong></td>
                                            <td class="amount-cell"><strong>₹${receipt.totalAmount.toLocaleString('en-IN')}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Rules & Regulations -->
                    <div class="rules-section">
                        <div class="rules-header">
                            <span style="font-size: 24px;">📜</span>
                            <h3 class="rules-title">PG Rules</h3>
                        </div>
                        
                        <div class="rules-list">
                            <div class="rule-item">
                                <div class="rule-number">1.</div>
                                <div class="rule-text">Valid government ID is mandatory at the time of admission.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">2.</div>
                                <div class="rule-text">Rent and security deposit must be paid before occupying the room.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">3.</div>
                                <div class="rule-text">Rent once paid is non-refundable.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">4.</div>
                                <div class="rule-text">A 30-day prior notice is required before vacating.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">5.</div>
                                <div class="rule-text"><strong>If 30 days' prior notice is not given, the resident must pay the full month's rent and the security deposit will not be refunded.</strong></div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">6.</div>
                                <div class="rule-text">Entry into the PG must be before <strong>10:30 PM</strong>.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">7.</div>
                                <div class="rule-text">Guests and overnight stays are not allowed.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">8.</div>
                                <div class="rule-text">Residents must maintain cleanliness; damages will be charged.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">9.</div>
                                <div class="rule-text">Electrical appliances are not allowed; avoid wastage of electricity and water.</div>
                            </div>
                            
                            <div class="rule-item">
                                <div class="rule-number">10.</div>
                                <div class="rule-text">Management reserves the right to change rules and take action for violations.</div>
                            </div>
                        </div>
                        
                        <div class="agreement-text">
                            By staying in this PG, residents agree to follow all the above rules.
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

// @desc    Send receipt via email
// @route   POST /api/email/send
// @access  Private
const sendReceiptEmail = async (req, res) => {
    try {
        const { receiptId, recipientEmail, subject, customMessage } = req.body;
        
        console.log('📧 Email sending request received:', { receiptId, recipientEmail });
        
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
        const user = await User.findById(req.user.id).select('pgName pgAddress pgContact email emailSignature');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log('📄 Generating PDF for receipt:', receipt.receiptNumber);
        
        // Generate PDF (QR code removed from PDF generator)
        const pdfBuffer = await generateReceiptPDF(receipt, user, null); // No QR code
        
        // Create transporter
        const transporter = getTransporter();
        
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
        
        // Generate professional HTML
        const emailHtml = generateProfessionalEmailHTML(receipt, user, customMessage);
        
        // Determine sender email
        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        if (!senderEmail) {
            throw new Error('SMTP_FROM or SMTP_USER environment variable is not set');
        }
        
        console.log('📤 Preparing to send email to:', emailToSend);
        
        // Send email
        const mailOptions = {
            from: `"${user.pgName}" <${senderEmail}>`,
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
        
        console.log('🚀 Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        
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
                subject: emailSubject
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
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Email error:', error.message);
        
        let errorMessage = 'Failed to send email';
        let statusCode = 500;
        
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check SMTP credentials.';
            statusCode = 401;
        } else if (error.code === 'ENOTFOUND') {
            errorMessage = 'SMTP server not found. Please check SMTP host configuration.';
            statusCode = 503;
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Connection refused by SMTP server.';
            statusCode = 503;
        }
        
        res.status(statusCode).json({ 
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Send bulk receipts
// @route   POST /api/email/bulk
// @access  Private
const sendBulkReceipts = async (req, res) => {
    try {
        const { receiptIds, customMessage } = req.body;
        
        console.log('📧 Bulk email request received for', receiptIds?.length, 'receipts');
        
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
        const user = await User.findById(req.user.id).select('pgName pgAddress pgContact email emailSignature');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Get transporter
        const transporter = getTransporter();
        const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        
        if (!senderEmail) {
            return res.status(500).json({
                success: false,
                message: 'SMTP configuration error. Please check environment variables.'
            });
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
                
                // Generate HTML
                const emailHtml = generateProfessionalEmailHTML(receipt, user, customMessage);
                
                // Send email
                const mailOptions = {
                    from: `"${user.pgName}" <${senderEmail}>`,
                    to: receipt.tenantEmail,
                    subject: `Payment Receipt ${receipt.receiptNumber} - ${user.pgName}`,
                    text: `Please view this email in HTML format for better experience.`,
                    html: emailHtml,
                    attachments: [{
                        filename: `receipt-${receipt.receiptNumber}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }]
                };
                
                const info = await transporter.sendMail(mailOptions);
                
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
                        messageId: info.messageId
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
                    timestamp: new Date().toISOString()
                });
                
                // Small delay between emails
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
                skipped: errors.filter(e => e.status === 'skipped').length
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        const totalAmount = results.reduce((sum, r) => sum + (r.amount || 0), 0);
        
        console.log(`✅ Bulk email completed: ${results.length} sent, ${errors.length} failed/skipped`);
        
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
                    successRate: ((results.length / receiptIds.length) * 100).toFixed(1) + '%'
                },
                results: results.sort((a, b) => a.receiptNumber.localeCompare(b.receiptNumber)),
                errors: errors.sort((a, b) => (a.receiptNumber || a.receiptId).localeCompare(b.receiptNumber || b.receiptId))
            }
        });
        
    } catch (error) {
        console.error('❌ Bulk email error:', error.message);
        
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
        .select('timestamp action details.ipAddress details.recipientEmail details.messageId');
        
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
                    ipAddress: log.details.ipAddress
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