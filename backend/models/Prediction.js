const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    ref: 'Transaction'
  },
  isFraud: {
    type: Boolean,
    required: true,
    index: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  modelVersion: {
    type: String,
    default: 'v1.0'
  },
  modelBreakdown: {
    autoencoder: Number,
    isolationForest: Number,
    xgboost: Number,
    randomForest: Number
  },
  features: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  explanation: {
    type: String
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  actualFraud: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
predictionSchema.index({ isFraud: 1, createdAt: -1 });
predictionSchema.index({ riskScore: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);

