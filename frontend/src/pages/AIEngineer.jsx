import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AIEngineer.css';

const AIEngineer = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [training, setTraining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const [info, metricsData] = await Promise.all([
        api.get('/ml/info'),
        api.get('/ml/metrics')
      ]);
      setModelInfo(info.data);
      setMetrics(metricsData.data);
    } catch (error) {
      console.error('Failed to load model info');
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      const response = await api.post('/ml/train', {
        dataset_path: 'data/transactions.csv'
      });
      toast.success('Model training completed!');
      await fetchModelInfo();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const modelsLoaded = modelInfo?.models_loaded || {};

  return (
    <div>
      <Navbar />
      <div className="ai-engineer-page">
        <div className="page-header">
          <h1>AI Engineer Portal</h1>
          <button onClick={handleTrain} disabled={training} className="train-btn">
            {training ? 'Training...' : 'Train Models'}
          </button>
        </div>

        <div className="model-status-grid">
          <div className="model-card">
            <h3>Model Status</h3>
            <div className="model-list">
              <div className="model-item">
                <span>Scaler</span>
                <span className={modelsLoaded.scaler ? 'status-on' : 'status-off'}>
                  {modelsLoaded.scaler ? '✓ Loaded' : '✗ Not Loaded'}
                </span>
              </div>
              <div className="model-item">
                <span>Isolation Forest</span>
                <span className={modelsLoaded.isolation_forest ? 'status-on' : 'status-off'}>
                  {modelsLoaded.isolation_forest ? '✓ Loaded' : '✗ Not Loaded'}
                </span>
              </div>
              <div className="model-item">
                <span>XGBoost</span>
                <span className={modelsLoaded.xgboost ? 'status-on' : 'status-off'}>
                  {modelsLoaded.xgboost ? '✓ Loaded' : '✗ Not Loaded'}
                </span>
              </div>
              <div className="model-item">
                <span>Random Forest</span>
                <span className={modelsLoaded.random_forest ? 'status-on' : 'status-off'}>
                  {modelsLoaded.random_forest ? '✓ Loaded' : '✗ Not Loaded'}
                </span>
              </div>
              <div className="model-item">
                <span>Autoencoder</span>
                <span className={modelsLoaded.autoencoder ? 'status-on' : 'status-off'}>
                  {modelsLoaded.autoencoder ? '✓ Loaded' : '✗ Not Loaded'}
                </span>
              </div>
            </div>
          </div>

          {metrics && Object.keys(metrics).length > 0 && (
            <div className="metrics-card">
              <h3>Model Metrics</h3>
              <div className="metrics-grid-internal">
                {metrics.xgboost && (
                  <div className="metric-item">
                    <strong>XGBoost:</strong>
                    <div>Accuracy: {(metrics.xgboost.accuracy * 100).toFixed(2)}%</div>
                    <div>ROC-AUC: {metrics.xgboost.roc_auc?.toFixed(3)}</div>
                  </div>
                )}
                {metrics.random_forest && (
                  <div className="metric-item">
                    <strong>Random Forest:</strong>
                    <div>Accuracy: {(metrics.random_forest.accuracy * 100).toFixed(2)}%</div>
                    <div>ROC-AUC: {metrics.random_forest.roc_auc?.toFixed(3)}</div>
                  </div>
                )}
                {metrics.isolation_forest && (
                  <div className="metric-item">
                    <strong>Isolation Forest:</strong>
                    <div>Accuracy: {(metrics.isolation_forest.accuracy * 100).toFixed(2)}%</div>
                    <div>ROC-AUC: {metrics.isolation_forest.roc_auc?.toFixed(3)}</div>
                  </div>
                )}
                {metrics.autoencoder && (
                  <div className="metric-item">
                    <strong>Autoencoder:</strong>
                    <div>Accuracy: {(metrics.autoencoder.accuracy * 100).toFixed(2)}%</div>
                    <div>ROC-AUC: {metrics.autoencoder.roc_auc?.toFixed(3)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="charts-section">
          <h2>Model Performance</h2>
          <div className="charts-grid">
            {metrics && metrics.xgboost && (
              <div className="chart-card">
                <h3>XGBoost Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Accuracy', value: metrics.xgboost.accuracy * 100 },
                    { name: 'ROC-AUC', value: metrics.xgboost.roc_auc * 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }} />
                    <Bar dataKey="value" fill="#38BDF8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {metrics && metrics.random_forest && (
              <div className="chart-card">
                <h3>Random Forest Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Accuracy', value: metrics.random_forest.accuracy * 100 },
                    { name: 'ROC-AUC', value: metrics.random_forest.roc_auc * 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }} />
                    <Bar dataKey="value" fill="#818CF8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {metrics && metrics.isolation_forest && (
              <div className="chart-card">
                <h3>Isolation Forest Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Accuracy', value: metrics.isolation_forest.accuracy * 100 },
                    { name: 'ROC-AUC', value: metrics.isolation_forest.roc_auc * 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }} />
                    <Bar dataKey="value" fill="#F472B6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {metrics && metrics.autoencoder && (
              <div className="chart-card">
                <h3>Autoencoder Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { name: 'Accuracy', value: metrics.autoencoder.accuracy * 100 },
                    { name: 'ROC-AUC', value: metrics.autoencoder.roc_auc * 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }} />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEngineer;

