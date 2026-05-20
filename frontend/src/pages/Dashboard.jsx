import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ModelAccuracyCard from '../components/ModelAccuracyCard';
import NotificationPopup from '../components/NotificationPopup';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudCount: 0,
    normalCount: 0,
    avgRiskScore: 0
  });
  const [modelAccuracy, setModelAccuracy] = useState(null);
  const [recentFraud, setRecentFraud] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchModelAccuracy();
    fetchNotifications();

    // Poll for new notifications every 10 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(notificationInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [predStats, fraudPreds] = await Promise.all([
        api.get('/predictions/stats'),
        api.get('/predictions/fraud?minRiskScore=70')
      ]);

      setStats({
        totalTransactions: predStats.data.total || 0,
        fraudCount: predStats.data.fraudCount || 0,
        normalCount: predStats.data.normalCount || 0,
        avgRiskScore: predStats.data.avgRiskScore || 0
      });

      setRecentFraud(fraudPreds.data.predictions?.slice(0, 10) || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelAccuracy = async () => {
    try {
      const response = await api.get('/ml/accuracy');
      setModelAccuracy(response.data);
    } catch (error) {
      console.error('Failed to fetch model accuracy:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications?limit=20&unreadOnly=true');
      const newNotifications = response.data.notifications || [];

      // Check for new notifications
      const existingIds = notifications.map(n => n._id);
      const brandNewNotifications = newNotifications.filter(n => !existingIds.includes(n._id));

      if (brandNewNotifications.length > 0) {
        // Add new notifications to active popups
        setActiveNotifications(prev => [...prev, ...brandNewNotifications]);
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleCloseNotification = (notificationId) => {
    setActiveNotifications(prev => prev.filter(n => n._id !== notificationId));

    // Mark as read
    api.patch(`/notifications/${notificationId}/read`).catch(err => {
      console.error('Failed to mark notification as read:', err);
    });
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Real-time fraud detection overview</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalTransactions.toLocaleString()}</h3>
              <p>Total Transactions</p>
            </div>
          </div>

          <div className="stat-card fraud">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{stats.fraudCount.toLocaleString()}</h3>
              <p>Fraud Detected</p>
            </div>
          </div>

          <div className="stat-card safe">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.normalCount.toLocaleString()}</h3>
              <p>Normal Transactions</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.avgRiskScore.toFixed(1)}</h3>
              <p>Avg Risk Score</p>
            </div>
          </div>

          {/* Model Accuracy Card - Replaces duplicate */}
          {modelAccuracy && (
            <ModelAccuracyCard
              accuracy={modelAccuracy.overall_accuracy}
              models={modelAccuracy.models}
              modelVersion={modelAccuracy.model_version}
            />
          )}
        </div>

        <div className="dashboard-content">
          <div className="recent-fraud">
            <h2>Recent High-Risk Transactions</h2>
            {recentFraud.length === 0 ? (
              <div className="empty-state">No high-risk transactions found</div>
            ) : (
              <div className="fraud-list">
                {recentFraud.map((pred) => (
                  <div key={pred.transactionId} className="fraud-item">
                    <div className="fraud-info">
                      <span className="transaction-id">{pred.transactionId}</span>
                      <span className="risk-score" style={{
                        color: pred.riskScore >= 85 ? '#EF4444' : '#F59E0B'
                      }}>
                        Risk: {pred.riskScore}%
                      </span>
                    </div>
                    <div className="fraud-meta">
                      <span>Confidence: {pred.confidence?.toFixed(1)}%</span>
                      <span>Model: {pred.modelVersion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Popups */}
      <div className="notification-container">
        {activeNotifications.map((notification, index) => (
          <div
            key={notification._id}
            style={{
              position: 'fixed',
              top: `${20 + index * 120}px`,
              right: '20px',
              zIndex: 10000 + index
            }}
          >
            <NotificationPopup
              notification={notification}
              onClose={() => handleCloseNotification(notification._id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


