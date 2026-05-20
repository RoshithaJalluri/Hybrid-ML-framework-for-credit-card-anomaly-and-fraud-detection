import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './Transactions.css';

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    merchantCategory: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({});
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    merchantCategory: 'GROCERIES',
    location: '',
    deviceId: '',
    customerId: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.merchantCategory) params.append('merchantCategory', filters.merchantCategory);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await api.get(`/transactions?${params}`);
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 85) return '#EF4444';
    if (riskScore >= 70) return '#F59E0B';
    if (riskScore >= 50) return '#EAB308';
    return '#22C55E';
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/transactions', {
        amount: parseFloat(formData.amount),
        merchant: formData.merchant || `MERCHANT_${Math.floor(Math.random() * 1000)}`,
        merchantCategory: formData.merchantCategory,
        location: formData.location,
        deviceId: formData.deviceId,
        userId: user?.id || formData.customerId || `USER${Date.now()}`,
        timestamp: new Date().toISOString()
      });

      toast.success('Transaction created successfully!');
      setShowAddForm(false);
      setFormData({
        amount: '',
        merchant: '',
        merchantCategory: 'GROCERIES',
        location: '',
        deviceId: '',
        customerId: ''
      });
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="transactions-page">
        <div className="page-header">
          <h1>Transaction Monitoring</h1>
          <div className="header-actions">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-transaction-btn"
            >
              {showAddForm ? 'Cancel' : '+ Add Transaction'}
            </button>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DECLINED">Declined</option>
              <option value="FRAUD">Fraud</option>
            </select>
            <select
              value={filters.merchantCategory}
              onChange={(e) => setFilters({ ...filters, merchantCategory: e.target.value, page: 1 })}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="RETAIL">Retail</option>
              <option value="ONLINE">Online</option>
              <option value="GROCERIES">Groceries</option>
              <option value="TRAVEL">Travel</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="GAS_STATION">Gas Station</option>
              <option value="OTHERS">Others</option>
            </select>
          </div>
        </div>

        {showAddForm && (
          <div className="add-transaction-form">
            <h2>Add New Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    placeholder="1500.50"
                  />
                </div>
                <div className="form-group">
                  <label>Merchant Name *</label>
                  <input
                    type="text"
                    name="merchant"
                    value={formData.merchant}
                    onChange={handleInputChange}
                    required
                    placeholder="Walmart, Amazon, etc."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Merchant Category *</label>
                  <select
                    name="merchantCategory"
                    value={formData.merchantCategory}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="GROCERIES">Groceries</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="GAS_STATION">Gas Station</option>
                    <option value="ONLINE">Online</option>
                    <option value="RETAIL">Retail</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="ENTERTAINMENT">Entertainment</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>User ID *</label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId || user?.id || ''}
                    onChange={handleInputChange}
                    required
                    placeholder={user?.id || "USER001"}
                    readOnly={!!user?.id}
                  />
                  {user?.id && <small style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Using your account ID</small>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="New York, USA"
                  />
                </div>
                <div className="form-group">
                  <label>Device ID *</label>
                  <input
                    type="text"
                    name="deviceId"
                    value={formData.deviceId}
                    onChange={handleInputChange}
                    required
                    placeholder="device123"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Customer ID (Optional)</label>
                <input
                  type="text"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  placeholder="CUST001"
                />
              </div>
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? 'Processing...' : 'Submit Transaction'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : (
          <>
            <div className="transactions-table-container">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.transactionId}>
                      <td className="tx-id">{tx.transactionId}</td>
                      <td>${tx.amount?.toFixed(2)}</td>
                      <td>{tx.merchant}</td>
                      <td>{tx.merchantCategory}</td>
                      <td>
                        {tx.prediction ? (
                          <span
                            className="risk-badge"
                            style={{ backgroundColor: getRiskColor(tx.prediction.riskScore) }}
                          >
                            {tx.prediction.riskScore}%
                          </span>
                        ) : (
                          <span className="no-prediction">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${tx.status?.toLowerCase()}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;

