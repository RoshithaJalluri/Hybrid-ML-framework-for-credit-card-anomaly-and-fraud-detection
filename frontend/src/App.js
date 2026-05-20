import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIEngineer from './pages/AIEngineer';
import Admin from './pages/Admin';
import Analyst from './pages/Analyst';
import ModelPerformance from './pages/ModelPerformance';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-engineer"
              element={
                <PrivateRoute allowedRoles={['AI_ENGINEER', 'ADMIN']}>
                  <AIEngineer />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <Admin />
                </PrivateRoute>
              }
            />
            <Route
              path="/analyst"
              element={
                <PrivateRoute allowedRoles={['ANALYST', 'ADMIN']}>
                  <Analyst />
                </PrivateRoute>
              }
            />
            <Route
              path="/model-performance"
              element={
                <PrivateRoute>
                  <ModelPerformance />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

