const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const { authenticate, authorize } = require('../middlewares/auth');

// Get all predictions
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isFraud !== undefined) filter.isFraud = req.query.isFraud === 'true';
    if (req.query.minRiskScore) filter.riskScore = { $gte: parseInt(req.query.minRiskScore) };
    if (req.query.modelVersion) filter.modelVersion = req.query.modelVersion;

    const predictions = await Prediction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prediction.countDocuments(filter);

    res.json({
      predictions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fraud predictions (high risk)
router.get('/fraud', authenticate, async (req, res) => {
  try {
    const minRiskScore = parseInt(req.query.minRiskScore) || 70;
    const predictions = await Prediction.find({
      isFraud: true,
      riskScore: { $gte: minRiskScore }
    })
    .sort({ riskScore: -1 })
    .limit(100);

    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Review prediction (mark as reviewed)
router.patch('/:transactionId/review', authenticate, authorize('ADMIN', 'ANALYST'), async (req, res) => {
  try {
    const { actualFraud } = req.body;
    const prediction = await Prediction.findOneAndUpdate(
      { transactionId: req.params.transactionId },
      {
        reviewed: true,
        reviewedBy: req.user._id,
        reviewDate: new Date(),
        actualFraud
      },
      { new: true }
    );

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({ prediction });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get prediction statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const total = await Prediction.countDocuments();
    const fraudCount = await Prediction.countDocuments({ isFraud: true });
    const reviewedCount = await Prediction.countDocuments({ reviewed: true });
    
    const avgRiskScore = await Prediction.aggregate([
      { $group: { _id: null, avg: { $avg: '$riskScore' } } }
    ]);

    const riskDistribution = await Prediction.aggregate([
      {
        $bucket: {
          groupBy: '$riskScore',
          boundaries: [0, 30, 50, 70, 85, 100],
          default: 'other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      total,
      fraudCount,
      normalCount: total - fraudCount,
      reviewedCount,
      avgRiskScore: avgRiskScore[0]?.avg || 0,
      riskDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

