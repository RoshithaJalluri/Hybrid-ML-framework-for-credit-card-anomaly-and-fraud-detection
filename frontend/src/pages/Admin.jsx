import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'MONITOR'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', newUser);
      toast.success('User created successfully');
      setShowAddUser(false);
      setNewUser({ email: '', password: '', name: '', role: 'MONITOR' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
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

  return (
    <div>
      <Navbar />
      <div className="admin-page">
        <div className="page-header">
          <h1>Admin Portal</h1>
          <button onClick={() => setShowAddUser(true)} className="add-user-btn">
            + Add User
          </button>
        </div>

        {showAddUser && (
          <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Add New User</h2>
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="MONITOR">Monitor</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="AI_ENGINEER">AI Engineer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </button>
                  <button type="submit">Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="MONITOR">Monitor</option>
                      <option value="ANALYST">Analyst</option>
                      <option value="AI_ENGINEER">AI Engineer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Never'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

