const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['high_risk', 'multiple_fraud', 'unusual_location', 'large_amount', 'unusual_time']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: false
    },
    severity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    read: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
