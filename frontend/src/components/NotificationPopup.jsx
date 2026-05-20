import React, { useEffect, useState } from 'react';
import './NotificationPopup.css';

const NotificationPopup = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getSeverityClass = () => {
        switch (notification.severity) {
            case 'critical':
                return 'severity-critical';
            case 'high':
                return 'severity-high';
            case 'medium':
                return 'severity-medium';
            case 'low':
                return 'severity-low';
            default:
                return 'severity-medium';
        }
    };

    const getSeverityIcon = () => {
        switch (notification.severity) {
            case 'critical':
                return '🚨';
            case 'high':
                return '⚠️';
            case 'medium':
                return '⚡';
            case 'low':
                return 'ℹ️';
            default:
                return '🔔';
        }
    };

    return (
        <div
            className={`notification-popup ${getSeverityClass()} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
            onClick={handleClose}
        >
            <div className="notification-icon">
                {getSeverityIcon()}
            </div>
            <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                {notification.transactionId && (
                    <div className="notification-meta">
                        Transaction: {notification.transactionId}
                    </div>
                )}
            </div>
            <button className="notification-close" onClick={handleClose}>
                ✕
            </button>
        </div>
    );
};

export default NotificationPopup;
