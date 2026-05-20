import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import './Analyst.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="intro" style={{ color: entry.color }}>
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
            {entry.name.includes('Risk') ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analyst = () => {
  const [fraudTrends, setFraudTrends] = useState([]);
  const [transactionStats, setTransactionStats] = useState(null);
  const [highRiskCustomers, setHighRiskCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [trends, stats, customers] = await Promise.all([
        api.get('/analytics/fraud-trends?days=30'),
        api.get('/analytics/transaction-stats?days=30'),
        api.get('/analytics/high-risk-customers?minRiskScore=0&limit=20')
      ]);

      console.log('Fraud Trends Data:', trends.data.trends);
      setFraudTrends(trends.data.trends || []);
      setTransactionStats(stats.data || {});
      setHighRiskCustomers(customers.data.highRiskCustomers || []);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analyst-page loading-state">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analyst-page-wrapper">
      <Navbar />
      <div className="analyst-page">
        <div className="page-header">
          <h1>Bank Analyst Portal</h1>
          <p>Real-time fraud trends and categorical analytics</p>
        </div>

        {transactionStats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Transactions</h3>
              <p className="stat-value">
                {transactionStats.overall?.totalTransactions?.toLocaleString() || 0}
              </p>
            </div>
            <div className="stat-card">
              <h3>Total Volume</h3>
              <p className="stat-value">
                ${transactionStats.overall?.totalAmount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="stat-card fraud">
              <h3>Fraud Detected</h3>
              <p className="stat-value">
                {transactionStats.overall?.fraudCount || 0}
              </p>
            </div>
            <div className="stat-card">
              <h3>Avg. Transaction</h3>
              <p className="stat-value">
                ${transactionStats.overall?.avgAmount?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        )}

        <div className="charts-section">
          <div className="chart-card">
            <h2>Fraud Trends & Risk Scores</h2>
            {fraudTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={fraudTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="_id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#EF4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="Fraud Count"
                  />
                  <Area
                    type="monotone"
                    dataKey="avgRiskScore"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRisk)"
                    name="Avg Risk Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No fraud trends data available</div>
            )}
          </div>

          {transactionStats?.byCategory && transactionStats.byCategory.length > 0 && (
            <div className="chart-card">
              <h2>Volume by Category</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={transactionStats.byCategory}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="_id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="count"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    name="Transactions"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="high-risk-section">
          <h2>High-Risk Customers Registry</h2>
          {highRiskCustomers.length === 0 ? (
            <div className="empty-state">No high-risk customers found</div>
          ) : (
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer Identity</th>
                    <th>Fraud Count</th>
                    <th>Avg Risk</th>
                    <th>Peak Risk</th>
                    <th>Total Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let runningTotal = 0;
                    return highRiskCustomers.map((customer, idx) => {
                      runningTotal += customer.fraudCount;
                      return (
                        <tr key={idx}>
                          <td className="serial-number">{idx + 1}</td>
                          <td>
                            <span className="customer-id">{customer._id}</span>
                          </td>
                          <td className="fraud-count">{runningTotal}</td>
                          <td>{customer.avgRiskScore?.toFixed(1)}%</td>
                          <td className="high-risk">{customer.maxRiskScore?.toFixed(1)}%</td>
                          <td className="amount-col">${customer.totalAmount?.toFixed(2)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyst;
