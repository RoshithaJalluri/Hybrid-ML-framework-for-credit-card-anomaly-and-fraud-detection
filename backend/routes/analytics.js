const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Prediction = require('../models/Prediction');
const { authenticate, authorize } = require('../middlewares/auth');

// Get fraud trends
router.get('/fraud-trends', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Prediction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isFraud: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction statistics
router.get('/transaction-stats', authenticate, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const byCategory = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$merchantCategory',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get total fraud count (including all-time or within period as per requirement)
    const fraudCount = await Transaction.countDocuments({ status: 'FRAUD', timestamp: { $gte: startDate } });

    res.json({
      overall: {
        ...(stats[0] || {}),
        fraudCount: fraudCount
      },
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get high-risk customers
router.get('/high-risk-customers', authenticate, authorize('ANALYST', 'ADMIN'), async (req, res) => {
  try {
    const minRiskScore = parseInt(req.query.minRiskScore) || 70;
    const limit = parseInt(req.query.limit) || 50;

    const highRisk = await Prediction.aggregate([
      {
        $match: {
          riskScore: { $gte: minRiskScore },
          isFraud: true
        }
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'transactionId',
          foreignField: 'transactionId',
          as: 'transaction'
        }
      },
      { $unwind: '$transaction' },
      {
        $group: {
          _id: '$transaction.userId',
          fraudCount: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' },
          maxRiskScore: { $max: '$maxRiskScore' },
          totalAmount: { $sum: '$transaction.amount' }
        }
      },
      { $sort: { fraudCount: -1 } },
      { $limit: limit }
    ]);

    res.json({ highRiskCustomers: highRisk });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
