import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ModelAccuracyCard.css';

const ModelAccuracyCard = ({ accuracy, models, modelVersion }) => {
    const navigate = useNavigate();

    const getAccuracyColor = (acc) => {
        if (acc >= 75) return '#10B981'; // Green
        if (acc >= 65) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    const overallAccuracy = accuracy || 0;

    const handleDetailsClick = (e) => {
        e.stopPropagation();
        navigate('/model-performance');
    };

    return (
        <div className="stat-card model-accuracy-card" onClick={() => navigate('/model-performance')} style={{ cursor: 'pointer' }}>
            <div className="accuracy-circle-container">
                <div className="accuracy-icon">🎯</div>
                <div className="accuracy-percentage" style={{ color: getAccuracyColor(overallAccuracy) }}>
                    {overallAccuracy.toFixed(1)}%
                </div>
                <p className="card-label">Model Accuracy</p>
                {modelVersion && (
                    <span className="model-version">{modelVersion}</span>
                )}
            </div>

            <button
                className="details-button"
                onClick={handleDetailsClick}
                title="View full model performance report"
            >
                View Details →
            </button>
        </div>
    );
};

export default ModelAccuracyCard;
