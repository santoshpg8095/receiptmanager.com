const Receipt = require('../models/Receipt');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const amountToWords = require('../utils/amountToWords');
const { generateVerificationHash, verifyReceiptHash } = require('../utils/hashGenerator');
const { generateQRCode } = require('../utils/qrGenerator');
const { generateReceiptPDF } = require('../utils/pdfGenerator');

// @desc    Generate receipt number
const generateReceiptNumber = async (userId) => {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // Count receipts for this user in current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const count = await Receipt.countDocuments({
        user: userId,
        createdAt: { $gte: startOfMonth }
    });
    
    return `PG${year}${month}${(count + 1).toString().padStart(4, '0')}`;
};

// @desc    Create new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
    try {
        console.log('Creating receipt with data:', req.body); // Debug log
        
        const user = await User.findById(req.user.id);
        
        // Calculate totals
        const totalAmount = 
            parseFloat(req.body.amount || 0) +
            parseFloat(req.body.securityDeposit || 0) +
            parseFloat(req.body.electricityCharges || 0) +
            parseFloat(req.body.waterCharges || 0) +
            parseFloat(req.body.otherCharges || 0);
        
        const amountPaid = parseFloat(req.body.amountPaid || totalAmount);
        const balanceDue = totalAmount + parseFloat(req.body.previousBalance || 0) - amountPaid;
        
        // Generate receipt data
        const receiptNumber = await generateReceiptNumber(req.user.id);
        const amountInWords = amountToWords(amountPaid);
        
        // Handle dates properly
        let monthlyPaymentDate, paidDate;
        
        if (req.body.monthlyPaymentDate) {
            monthlyPaymentDate = new Date(req.body.monthlyPaymentDate);
            if (isNaN(monthlyPaymentDate.getTime())) {
                monthlyPaymentDate = new Date();
            }
        } else {
            monthlyPaymentDate = new Date();
        }
        
        if (req.body.paidDate) {
            paidDate = new Date(req.body.paidDate);
            if (isNaN(paidDate.getTime())) {
                paidDate = new Date();
            }
        } else {
            paidDate = new Date();
        }
        
        const receiptData = {
            receiptNumber,
            user: req.user.id,
            tenantName: req.body.tenantName,
            tenantEmail: req.body.tenantEmail,
            tenantPhone: req.body.tenantPhone,
            roomNumber: req.body.roomNumber,
            month: req.body.month,
            year: req.body.year,
            amount: parseFloat(req.body.amount || 0),
            amountInWords,
            paymentMode: req.body.paymentMode || 'cash',
            transactionId: req.body.transactionId,
            receivedFrom: req.body.receivedFrom || req.body.tenantName,
            forMonth: req.body.forMonth,
            // New date fields - ensure they're Date objects
            monthlyPaymentDate,
            paidDate,
            securityDeposit: parseFloat(req.body.securityDeposit || 0),
            electricityCharges: parseFloat(req.body.electricityCharges || 0),
            waterCharges: parseFloat(req.body.waterCharges || 0),
            otherCharges: parseFloat(req.body.otherCharges || 0),
            totalAmount,
            previousBalance: parseFloat(req.body.previousBalance || 0),
            amountPaid,
            balanceDue,
            notes: req.body.notes
        };

        console.log('Receipt data to save:', receiptData); // Debug log

        // Generate verification hash
        receiptData.verificationHash = generateVerificationHash({
            ...receiptData,
            userId: req.user.id
        });

        // Create receipt
        const receipt = await Receipt.create(receiptData);
        console.log('Created receipt:', receipt); // Debug log

        // Generate QR code
        const qrCodeDataUrl = await generateQRCode({
            receiptNumber: receipt.receiptNumber,
            verificationHash: receipt.verificationHash,
            tenantName: receipt.tenantName,
            amount: receipt.amountPaid
        });

        // Update receipt with QR code
        receipt.qrCode = qrCodeDataUrl;
        await receipt.save();

        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'create_receipt',
            details: { receiptId: receipt._id, receiptNumber },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json({
            message: 'Receipt created successfully',
            receipt: {
                ...receipt.toObject(),
                qrCode: qrCodeDataUrl
            }
        });
    } catch (error) {
        console.error('Error creating receipt:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all receipts for user
// @route   GET /api/receipts
// @access  Private
const getReceipts = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', month = '', year = '' } = req.query;
        
        const query = { user: req.user.id };
        
        // Add search filters
        if (search) {
            query.$or = [
                { tenantName: { $regex: search, $options: 'i' } },
                { receiptNumber: { $regex: search, $options: 'i' } },
                { tenantPhone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (month) query.month = month;
        if (year) query.year = parseInt(year);
        
        const receipts = await Receipt.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Receipt.countDocuments(query);
        
        res.json({
            receipts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalReceipts: total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single receipt
// @route   GET /api/receipts/:id
// @access  Private
const getReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        
        console.log('Fetched receipt:', receipt); // Debug log
        res.json(receipt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
  try {
    let receipt = await Receipt.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    
    // Calculate totals if amount fields are updated
    let updateData = { ...req.body };
    
    // If any amount-related fields are being updated, recalculate totals
    if (req.body.amount || req.body.securityDeposit || req.body.electricityCharges || 
        req.body.waterCharges || req.body.otherCharges || req.body.previousBalance || 
        req.body.amountPaid) {
      
      const totalAmount = 
        parseFloat(req.body.amount || receipt.amount) +
        parseFloat(req.body.securityDeposit || receipt.securityDeposit) +
        parseFloat(req.body.electricityCharges || receipt.electricityCharges) +
        parseFloat(req.body.waterCharges || receipt.waterCharges) +
        parseFloat(req.body.otherCharges || receipt.otherCharges);
      
      const amountPaid = parseFloat(req.body.amountPaid || receipt.amountPaid);
      const previousBalance = parseFloat(req.body.previousBalance || receipt.previousBalance);
      const balanceDue = totalAmount + previousBalance - amountPaid;
      
      updateData.totalAmount = totalAmount;
      updateData.balanceDue = balanceDue;
      
      if (req.body.amountPaid !== undefined) {
        updateData.amountInWords = amountToWords(amountPaid);
      }
    }
    
    // Update receipt
    receipt = await Receipt.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // Log action
    await AuditLog.create({
      user: req.user.id,
      action: 'update_receipt',
      details: { 
        receiptId: receipt._id, 
        receiptNumber: receipt.receiptNumber,
        updatedFields: Object.keys(req.body) 
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      message: 'Receipt updated successfully',
      receipt
    });
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        
        // Log action
        await AuditLog.create({
            user: req.user.id,
            action: 'delete_receipt',
            details: { receiptId: receipt._id, receiptNumber: receipt.receiptNumber },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        await receipt.deleteOne();
        
        res.json({ message: 'Receipt deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Download receipt PDF
// @route   GET /api/receipts/:id/download
// @access  Private
const downloadReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        
        const user = await User.findById(req.user.id);
        
        // Generate PDF
        const pdfBuffer = await generateReceiptPDF(receipt, user, receipt.qrCode);
        
        // Set headers
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="receipt-${receipt.receiptNumber}.pdf"`,
            'Content-Length': pdfBuffer.length
        });
        
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify receipt (public)
// @route   GET /api/receipts/verify/:hash
// @access  Public
const verifyReceipt = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({
            verificationHash: req.params.hash
        }).populate('user', 'name pgName pgAddress pgContact gstin');

        if (!receipt) {
            return res.status(404).json({ 
                message: 'Receipt not found or invalid verification code',
                isValid: false
            });
        }

        // Update verification stats
        receipt.isVerified = true;
        receipt.verificationCount += 1;
        receipt.lastVerifiedAt = new Date();
        await receipt.save();

        // Log verification
        await AuditLog.create({
            user: receipt.user._id,
            action: 'verification',
            details: { 
                receiptId: receipt._id, 
                receiptNumber: receipt.receiptNumber,
                isValid: true,
                ipAddress: req.ip 
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            isValid: true,
            message: 'Receipt verified successfully',
            receipt: {
                _id: receipt._id,
                receiptNumber: receipt.receiptNumber,
                tenantName: receipt.tenantName,
                roomNumber: receipt.roomNumber,
                amountPaid: receipt.amountPaid,
                forMonth: receipt.forMonth,
                createdAt: receipt.createdAt,
                user: {
                    name: receipt.user.name,
                    pgName: receipt.user.pgName,
                    pgAddress: receipt.user.pgAddress,
                    pgContact: receipt.user.pgContact,
                    gstin: receipt.user.gstin
                },
                verificationCount: receipt.verificationCount,
                lastVerifiedAt: receipt.lastVerifiedAt
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            message: 'Server error',
            isValid: false
        });
    }
};

module.exports = {
    createReceipt,
    getReceipts,
    getReceipt,
    updateReceipt,
    deleteReceipt,
    downloadReceipt,
    verifyReceipt
};