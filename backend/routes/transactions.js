const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Prediction = require('../models/Prediction');
const { authenticate, authorize } = require('../middlewares/auth');
const axios = require('axios');

// Get all transactions (with pagination and filters)
router.get('/', authenticate, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.status) filter.status = req.query.status;
        if (req.query.userId) filter.userId = req.query.userId;
        if (req.query.merchantCategory) filter.merchantCategory = req.query.merchantCategory;
        if (req.query.startDate || req.query.endDate) {
            filter.timestamp = {};
            if (req.query.startDate) filter.timestamp.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filter.timestamp.$lte = new Date(req.query.endDate);
        }

        const transactions = await Transaction.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get predictions for transactions
        const transactionIds = transactions.map(t => t.transactionId);
        const predictions = await Prediction.find({ transactionId: { $in: transactionIds } })
            .lean();

        const predictionsMap = {};
        predictions.forEach(p => {
            predictionsMap[p.transactionId] = p;
        });

        const transactionsWithPredictions = transactions.map(t => ({
            ...t,
            prediction: predictionsMap[t.transactionId] || null
        }));

        const total = await Transaction.countDocuments(filter);

        res.json({
            transactions: transactionsWithPredictions,
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

// Get single transaction
router.get('/:transactionId', authenticate, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        const prediction = await Prediction.findOne({ transactionId: req.params.transactionId });

        res.json({
            transaction,
            prediction
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new transaction and get prediction
router.post('/', authenticate, async (req, res) => {
    try {
        const transactionData = req.body;

        // Generate transaction ID if not provided
        if (!transactionData.transactionId) {
            transactionData.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        }

        // Convert location string to object if needed
        if (typeof transactionData.location === 'string') {
            const locationParts = transactionData.location.split(',').map(s => s.trim());
            transactionData.location = {
                city: locationParts[0] || '',
                country: locationParts[1] || 'USA'
            };
        }

        // Create transaction
        const transaction = new Transaction(transactionData);
        await transaction.save();

        // Call ML service for prediction
        try {
            // Format location for ML service - CSV format uses simple country code string (e.g., "US", "FR")
            let locationData = transaction.location;
            if (typeof locationData === 'object' && locationData !== null) {
                // If location is object, extract country code (CSV format is just country code)
                locationData = locationData.country || locationData.city || 'US';
            } else if (typeof locationData === 'string') {
                // If location is "New York, USA" format, extract country code
                const parts = locationData.split(',').map(s => s.trim());
                if (parts.length > 1) {
                    // Take last part as country, but if it's full name, use first 2 chars
                    locationData = parts[parts.length - 1].length > 2 ? parts[parts.length - 1].substring(0, 2).toUpperCase() : parts[parts.length - 1].toUpperCase();
                } else {
                    // If single value, use first 2 chars as country code
                    locationData = locationData.length > 2 ? locationData.substring(0, 2).toUpperCase() : locationData.toUpperCase();
                }
            } else {
                locationData = 'US'; // Default
            }

            const mlResponse = await axios.post(
                `${process.env.ML_SERVICE_URL || 'http://localhost:5000'}/predict`,
                {
                    transaction: {
                        amount: transaction.amount,
                        merchantCategory: transaction.merchantCategory,
                        location: locationData, // Send as simple string like CSV format
                        deviceId: transaction.deviceId,
                        timestamp: transaction.timestamp || new Date().toISOString()
                    }
                },
                { timeout: 10000 }
            );

            // Save prediction
            const prediction = new Prediction({
                transactionId: transaction.transactionId,
                isFraud: mlResponse.data.isFraud,
                riskScore: mlResponse.data.riskScore,
                confidence: mlResponse.data.confidence,
                modelVersion: mlResponse.data.modelVersion || 'v1.0',
                modelBreakdown: mlResponse.data.modelBreakdown,
                features: mlResponse.data.features,
                explanation: mlResponse.data.explanation
            });
            await prediction.save();

            // Create notifications for suspicious activities
            const Notification = require('../models/Notification');
            const notifications = [];

            // 1. High-risk transaction (risk score >= 85)
            if (mlResponse.data.riskScore >= 85) {
                notifications.push({
                    type: 'high_risk',
                    title: '🚨 High-Risk Transaction Detected',
                    message: `Transaction ${transaction.transactionId} has a risk score of ${mlResponse.data.riskScore}%. Amount: $${transaction.amount}`,
                    transactionId: transaction.transactionId,
                    severity: 'critical',
                    metadata: {
                        riskScore: mlResponse.data.riskScore,
                        amount: transaction.amount,
                        location: transaction.location
                    }
                });
            }

            // 2. Large amount transaction (> $500)
            if (transaction.amount > 500) {
                notifications.push({
                    type: 'large_amount',
                    title: '💰 Large Transaction Alert',
                    message: `Large transaction of $${transaction.amount} detected from ${transaction.deviceId}`,
                    transactionId: transaction.transactionId,
                    severity: transaction.amount > 1000 ? 'high' : 'medium',
                    metadata: {
                        amount: transaction.amount,
                        deviceId: transaction.deviceId
                    }
                });
            }

            // 3. High-risk location (Nigeria, Russia, China)
            const highRiskCountries = ['NG', 'RU', 'CN', 'Nigeria', 'Russia', 'China'];
            const locationStr = typeof transaction.location === 'object'
                ? transaction.location.country
                : transaction.location;
            const isHighRiskLocation = highRiskCountries.some(country =>
                locationStr?.toUpperCase().includes(country.toUpperCase())
            );

            if (isHighRiskLocation) {
                notifications.push({
                    type: 'unusual_location',
                    title: '🌍 High-Risk Location Alert',
                    message: `Transaction from high-risk location: ${locationStr}. Amount: $${transaction.amount}`,
                    transactionId: transaction.transactionId,
                    severity: 'high',
                    metadata: {
                        location: transaction.location,
                        amount: transaction.amount
                    }
                });
            }

            // 4. Unusual time (2 AM - 5 AM)
            const transactionHour = new Date(transaction.timestamp).getHours();
            if (transactionHour >= 2 && transactionHour < 5) {
                notifications.push({
                    type: 'unusual_time',
                    title: '🕐 Unusual Time Transaction',
                    message: `Transaction at ${transactionHour}:00 (late night). Amount: $${transaction.amount}`,
                    transactionId: transaction.transactionId,
                    severity: 'medium',
                    metadata: {
                        hour: transactionHour,
                        amount: transaction.amount
                    }
                });
            }

            // 5. Check for multiple fraud attempts from same device (within 1 hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentFraudCount = await Prediction.countDocuments({
                transactionId: { $ne: transaction.transactionId },
                isFraud: true,
                createdAt: { $gte: oneHourAgo }
            });

            // Get transactions from same device in last hour
            const sameDeviceTransactions = await Transaction.find({
                deviceId: transaction.deviceId,
                transactionId: { $ne: transaction.transactionId },
                timestamp: { $gte: oneHourAgo }
            });

            const sameDeviceFraudCount = await Prediction.countDocuments({
                transactionId: { $in: sameDeviceTransactions.map(t => t.transactionId) },
                isFraud: true
            });

            if (sameDeviceFraudCount >= 2) {
                notifications.push({
                    type: 'multiple_fraud',
                    title: '⚠️ Multiple Fraud Attempts Detected',
                    message: `${sameDeviceFraudCount + 1} fraud attempts from device ${transaction.deviceId} in the last hour`,
                    transactionId: transaction.transactionId,
                    severity: 'critical',
                    metadata: {
                        deviceId: transaction.deviceId,
                        fraudCount: sameDeviceFraudCount + 1,
                        timeWindow: '1 hour'
                    }
                });
            }

            // Save all notifications
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
                console.log(`🔔 Created ${notifications.length} notification(s) for transaction ${transaction.transactionId}`);
            }

            // Update transaction status based on prediction
            const riskScore = mlResponse.data.riskScore || 0;
            if (mlResponse.data.isFraud) {
                transaction.status = 'FRAUD';
            } else if (riskScore >= 70) {
                transaction.status = 'DECLINED'; // High risk but not confirmed fraud
            } else if (riskScore >= 50) {
                transaction.status = 'PENDING'; // Medium risk, needs review
            } else {
                transaction.status = 'APPROVED'; // Low risk, approve
            }
            await transaction.save();

            console.log(`📊 Transaction ${transaction.transactionId}: Risk=${riskScore}, isFraud=${mlResponse.data.isFraud}, Status=${transaction.status}`);

            res.status(201).json({
                transaction,
                prediction
            });
        } catch (mlError) {
            console.error('ML Service Error:', mlError.message);
            console.error('ML Service Error Details:', mlError.response?.data || mlError.message);

            // If ML service fails, still approve transaction but mark as needing review
            transaction.status = 'APPROVED';
            await transaction.save();

            res.status(201).json({
                transaction,
                prediction: null,
                warning: 'ML prediction unavailable - Transaction approved but needs review'
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Bulk upload transactions (CSV)
router.post('/bulk', authenticate, authorize('ADMIN', 'AI_ENGINEER'), async (req, res) => {
    try {
        // This would handle CSV file upload
        // For now, accept array of transactions
        const transactions = req.body.transactions || [];

        const savedTransactions = [];
        for (const txData of transactions) {
            if (!txData.transactionId) {
                txData.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
            }
            const transaction = new Transaction(txData);
            await transaction.save();
            savedTransactions.push(transaction);
        }

        res.status(201).json({
            message: `${savedTransactions.length} transactions created`,
            transactions: savedTransactions
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update transaction status
router.patch('/:transactionId/status', authenticate, authorize('ADMIN', 'ANALYST'), async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { transactionId: req.params.transactionId },
            { status },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ transaction });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
