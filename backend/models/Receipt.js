const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenantName: {
        type: String,
        required: [true, 'Please add tenant name']
    },
    tenantEmail: {
        type: String,
        lowercase: true
    },
    tenantPhone: {
        type: String,
        required: [true, 'Please add tenant phone number']
    },
    roomNumber: {
        type: String,
        required: [true, 'Please add room number']
    },
    month: {
        type: String,
        required: [true, 'Please add month']
    },
    year: {
        type: Number,
        required: [true, 'Please add year']
    },
    amount: {
        type: Number,
        required: [true, 'Please add amount']
    },
    amountInWords: {
        type: String,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'other'],
        default: 'cash'
    },
    transactionId: {
        type: String
    },
    receivedFrom: {
        type: String,
        required: true
    },
    forMonth: {
        type: String,
        required: true
    },
    // New date fields
    monthlyPaymentDate: {
        type: Date,
        required: [true, 'Please add monthly payment date']
    },
    paidDate: {
        type: Date,
        required: [true, 'Please add paid date']
    },
    securityDeposit: {
        type: Number,
        default: 0
    },
    electricityCharges: {
        type: Number,
        default: 0
    },
    waterCharges: {
        type: Number,
        default: 0
    },
    otherCharges: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    previousBalance: {
        type: Number,
        default: 0
    },
    amountPaid: {
        type: Number,
        required: true
    },
    balanceDue: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    },
    qrCode: {
        type: String
    },
    verificationHash: {
        type: String,
        required: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCount: {
        type: Number,
        default: 0
    },
    lastVerifiedAt: {
        type: Date
    },
    sentViaEmail: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
ReceiptSchema.index({ receiptNumber: 1 });
ReceiptSchema.index({ verificationHash: 1 });
ReceiptSchema.index({ user: 1, createdAt: -1 });
ReceiptSchema.index({ tenantName: 1 });
ReceiptSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Receipt', ReceiptSchema);