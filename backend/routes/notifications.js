const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middlewares/auth');

// Get all notifications for current user
router.get('/', authenticate, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const unreadOnly = req.query.unreadOnly === 'true';

        const filter = {};
        if (unreadOnly) {
            filter.read = false;
        }

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread notification count
router.get('/unread-count', authenticate, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ notification });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticate, async (req, res) => {
    try {
        await Notification.updateMany(
            { read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create notification (internal use)
router.post('/', async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json({ notification });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete old notifications (cleanup)
router.delete('/cleanup', authenticate, async (req, res) => {
    try {
        const daysOld = parseInt(req.query.days) || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await Notification.deleteMany({
            createdAt: { $lt: cutoffDate },
            read: true
        });

        res.json({
            message: `Deleted ${result.deletedCount} old notifications`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
