import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './ModelPerformance.css';

const ModelPerformance = () => {
    const [modelAccuracy, setModelAccuracy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModelAccuracy();
    }, []);

    const fetchModelAccuracy = async () => {
        try {
            const response = await api.get('/ml/accuracy');
            setModelAccuracy(response.data);
        } catch (error) {
            console.error('Failed to fetch model accuracy:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAccuracyColor = (acc) => {
        if (acc >= 75) return '#10B981'; // Green
        if (acc >= 65) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    if (loading) {
        return (
            <div className="performance-page">
                <Navbar />
                <div className="loading-container">Loading detailed performance metrics...</div>
            </div>
        );
    }

    const { overall_accuracy, models, model_version } = modelAccuracy || {};

    return (
        <div className="performance-page">
            <Navbar />
            <div className="performance-container">
                <div className="performance-header">
                    <h1>Model Performance</h1>
                    <p>Detailed accuracy and metrics for all pipeline components (Version: {model_version})</p>
                </div>

                <div className="overall-summary-card">
                    <div className="summary-stat">
                        <h2 style={{ color: getAccuracyColor(overall_accuracy) }}>
                            {overall_accuracy?.toFixed(1)}%
                        </h2>
                        <p>Weighted Ensemble Accuracy</p>
                    </div>
                    <div className="summary-desc">
                        The overall accuracy is calculated based on a weighted average of our primary classifiers (XGBoost 60%, Random Forest 40%).
                    </div>
                </div>

                <div className="models-grid">
                    {models && Object.entries(models).map(([modelName, metrics]) => {
                        const isScaler = modelName === 'scaler';
                        const label = modelName === 'xgboost' ? 'XGBoost (Classifier)' :
                            modelName === 'random_forest' ? 'Random Forest (Classifier)' :
                                modelName === 'isolation_forest' ? 'Isolation Forest (Anomaly)' :
                                    modelName === 'autoencoder' ? 'Autoencoder (Neural)' :
                                        'Feature Scaler';

                        return (
                            <div key={modelName} className={`performance-item ${isScaler ? 'scaler-item' : ''}`}>
                                <div className="item-header">
                                    <div className="item-name">{label}</div>
                                    {!isScaler ? (
                                        <div className="item-acc-badge" style={{ backgroundColor: getAccuracyColor(metrics.accuracy) }}>
                                            {metrics.accuracy.toFixed(1)}%
                                        </div>
                                    ) : (
                                        <div className="item-status-badge active">
                                            {metrics.status}
                                        </div>
                                    )}
                                </div>

                                {!isScaler ? (
                                    <div className="item-content">
                                        <div className="metric-row">
                                            <span className="label">ROC-AUC Score:</span>
                                            <span className="value">{metrics.roc_auc.toFixed(1)}%</span>
                                        </div>
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${metrics.accuracy}%`,
                                                    backgroundColor: getAccuracyColor(metrics.accuracy)
                                                }}
                                            />
                                        </div>
                                        <p className="item-desc">
                                            {modelName === 'xgboost' ? 'Gradient boosted decision trees for high-precision classification.' :
                                                modelName === 'random_forest' ? 'Ensemble learning method using multiple decision trees.' :
                                                    modelName === 'isolation_forest' ? 'Unsupervised anomaly detection based on isolation.' :
                                                        'Neural network trained to flag anomalies via reconstruction error.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="item-content">
                                        <p className="status-msg">{metrics.message}</p>
                                        <p className="item-desc">Ensures all transaction features are normalized before processing.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="back-action">
                    <button className="back-btn" onClick={() => window.history.back()}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModelPerformance;
