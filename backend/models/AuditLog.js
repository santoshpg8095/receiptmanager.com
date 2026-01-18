const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        enum: [
            'login', 
            'logout', 
            'create_receipt', 
            'update_receipt', 
            'delete_receipt', 
            'email_sent', 
            'verification',
            'register',
            'data_export',
            'enable_2fa',
            'disable_2fa',
            'delete_account',
            'profile_update',
            'password_change'
        ]
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
AuditLogSchema.index({ user: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);