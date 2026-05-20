const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  merchant: {
    type: String,
    required: true
  },
  merchantCategory: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['MOBILE', 'DESKTOP', 'TABLET', 'OTHER']
  },
  cardType: {
    type: String,
    enum: ['CREDIT', 'DEBIT', 'PREPAID']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'FRAUD'],
    default: 'PENDING'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ status: 1, timestamp: -1 });
transactionSchema.index({ merchantCategory: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);

