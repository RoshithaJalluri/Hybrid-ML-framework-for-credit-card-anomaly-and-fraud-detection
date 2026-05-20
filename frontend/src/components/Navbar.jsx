import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>🛡️ FraudGuard AI</h2>
        </div>
        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={isActive('/dashboard') ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link
            to="/transactions"
            className={isActive('/transactions') ? 'active' : ''}
          >
            Transactions
          </Link>
          {(user?.role === 'AI_ENGINEER' || user?.role === 'ADMIN') && (
            <Link
              to="/ai-engineer"
              className={isActive('/ai-engineer') ? 'active' : ''}
            >
              AI Engineer
            </Link>
          )}
          {(user?.role === 'ANALYST' || user?.role === 'ADMIN') && (
            <Link
              to="/analyst"
              className={isActive('/analyst') ? 'active' : ''}
            >
              Analyst
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={isActive('/admin') ? 'active' : ''}
            >
              Admin
            </Link>
          )}
        </div>
        <div className="navbar-user">
          <span>{user?.name || user?.email}</span>
          <span className="role-badge">{user?.role}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
