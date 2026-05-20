const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const axios = require('axios');

// Train model
router.post('/train', authenticate, authorize('AI_ENGINEER', 'ADMIN'), async (req, res) => {
    try {
        const response = await axios.post(
            `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/train`,
            req.body,
            { timeout: 300000 } // 5 minutes timeout
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Get model metrics
router.get('/metrics', authenticate, authorize('AI_ENGINEER', 'ADMIN'), async (req, res) => {
    try {
        const response = await axios.get(
            `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/metrics`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Get model info
router.get('/info', authenticate, async (req, res) => {
    try {
        const response = await axios.get(
            `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/info`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Get model accuracy
router.get('/accuracy', authenticate, async (req, res) => {
    try {
        const response = await axios.get(
            `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/metrics/accuracy`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Get metrics summary
router.get('/summary', authenticate, async (req, res) => {
    try {
        const response = await axios.get(
            `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/metrics/summary`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

// Upload dataset
router.post('/dataset/upload', authenticate, authorize('AI_ENGINEER', 'ADMIN'), async (req, res) => {
    try {
        const response = await axios.post(
            `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/dataset/upload`,
            req.body,
            { timeout: 60000 }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

module.exports = router;
