import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const formatDate = (value) => {
  if (!value) return '-';
  return value.split('T')[0];
};

const formatTime = (value) => {
  if (!value) return '-';
  return value.slice(0, 5);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString();
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersData, setUsersData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsersData();
    }
  }, [isAuthenticated, period, customFrom, customTo]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setLoading(true);

    try {
      const res = await adminAPI.verifyPassword(password);
      if (res.data.verified) {
        setIsAuthenticated(true);
        setPassword('');
      }
    } catch (err) {
      setPasswordError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { period };
      if (period === 'custom') {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      }
      const res = await adminAPI.getAllUsersData(params);
      setUsersData(res.data);
    } catch (err) {
      console.error('Failed to load users data', err);
      setError(err.response?.data?.error || 'Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const params = { period };
      if (period === 'custom') {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      }
      const res = await adminAPI.getUserDetailedData(userId, params);
      setUserDetails(res.data);
      setSelectedUser(userId);
    } catch (err) {
      console.error('Failed to load user details', err);
      setError(err.response?.data?.error || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (value) => {
    setPeriod(value);
    setSelectedUser(null);
    setUserDetails(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="stats-page">
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div className="auth-card" style={{ maxWidth: '400px' }}>
            <h2>Admin Access</h2>
            {passwordError && <div className="error-banner">{passwordError}</div>}
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="admin-password">Password</label>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <header className="stats-header">
        <div className="header-left">
          <h1 className="logo">Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="stats-main">
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Period Selector */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`period-btn ${period === 'week' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('week')}
            >
              This Week
            </button>
            <button
              type="button"
              className={`period-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`period-btn ${period === 'custom' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('custom')}
            >
              Custom Range
            </button>
            {period === 'custom' && (
              <>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  placeholder="From"
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                />
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  placeholder="To"
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e0e0e0' }}
                />
              </>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={fetchUsersData}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Summary Stats */}
          {usersData && usersData.totals && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
              <div className="check-in-table-card" style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Hours</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                  {usersData.totals.totalHours.toFixed(2)}
                </div>
              </div>
              <div className="check-in-table-card" style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Videos</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                  {usersData.totals.totalVideos}
                </div>
              </div>
              <div className="check-in-table-card" style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Check-Ins</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                  {usersData.totals.totalCheckIns}
                </div>
              </div>
              <div className="check-in-table-card" style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Work Items</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                  {usersData.totals.totalWorkItems}
                </div>
              </div>
            </div>
          )}

          {loading && !usersData ? (
            <div className="loading-inline">
              <div className="loader"></div>
              <span>Loading users data...</span>
            </div>
          ) : usersData && usersData.users ? (
            <>
              {/* Users Table */}
              <section className="check-in-table-card">
                <h2>All Users</h2>
                <div className="check-in-table-wrapper">
                  <table className="check-in-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Hours</th>
                        <th>Videos (Check-Ins)</th>
                        <th>Videos (Work Items)</th>
                        <th>Total Videos</th>
                        <th>Check-Ins</th>
                        <th>Work Items</th>
                        <th>Last Activity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.users.map((user) => (
                        <tr key={user.id}>
                          <td><strong>{user.username}</strong></td>
                          <td>{user.email}</td>
                          <td>{user.stats.totalHours.toFixed(2)}</td>
                          <td>{user.stats.totalVideosFromCheckIns}</td>
                          <td>{user.stats.totalVideosFromWorkItems}</td>
                          <td><strong>{user.stats.totalVideos}</strong></td>
                          <td>{user.stats.checkInCount}</td>
                          <td>{user.stats.workItemCount}</td>
                          <td>{user.stats.lastActivity ? formatDateTime(user.stats.lastActivity) : '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => fetchUserDetails(user.id)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* User Details */}
              {selectedUser && userDetails && (
                <section className="check-in-table-card" style={{ marginTop: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Details: {userDetails.user.username}</h2>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setSelectedUser(null);
                        setUserDetails(null);
                      }}
                    >
                      Close
                    </button>
                  </div>

                  {/* User Summary */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '15px', 
                    marginBottom: '30px' 
                  }}>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Total Hours</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userDetails.hours.total.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Videos (Check-Ins)</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userDetails.videos.fromCheckIns}</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Videos (Work Items)</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userDetails.videos.fromWorkItems}</div>
                    </div>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Total Videos</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{userDetails.videos.total}</div>
                    </div>
                  </div>

                  {/* Check-Ins */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3>Check-Ins ({userDetails.hours.checkIns.length})</h3>
                    <div className="check-in-table-wrapper">
                      <table className="check-in-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Hours</th>
                            <th>Videos</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.hours.checkIns.length === 0 ? (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No check-ins found</td>
                            </tr>
                          ) : (
                            userDetails.hours.checkIns.map((checkIn) => (
                              <tr key={checkIn.id}>
                                <td>{formatDate(checkIn.check_in_date)}</td>
                                <td>{formatTime(checkIn.start_time)}</td>
                                <td>{formatTime(checkIn.end_time)}</td>
                                <td>{Number(checkIn.hours).toFixed(2)}</td>
                                <td>{checkIn.video_count !== null ? checkIn.video_count : '-'}</td>
                                <td>{checkIn.notes || '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Work Items */}
                  <div style={{ marginBottom: '30px' }}>
                    <h3>Work Items ({userDetails.workItems.length})</h3>
                    <div className="check-in-table-wrapper">
                      <table className="check-in-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Videos</th>
                            <th>Source</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.workItems.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No work items found</td>
                            </tr>
                          ) : (
                            userDetails.workItems.map((item) => (
                              <tr key={item.id}>
                                <td>{item.name || '-'}</td>
                                <td>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    textTransform: 'capitalize',
                                    background: item.status === 'completed' ? '#d1fae5' : item.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                                    color: item.status === 'completed' ? '#065f46' : item.status === 'in_progress' ? '#1e40af' : '#92400e'
                                  }}>
                                    {item.status}
                                  </span>
                                </td>
                                <td>{item.video_count !== null ? item.video_count : '-'}</td>
                                <td style={{ textTransform: 'capitalize' }}>{item.source || '-'}</td>
                                <td>{formatDate(item.created_at)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Activity Logs */}
                  <div>
                    <h3>Activity Logs ({userDetails.activities.length})</h3>
                    <div className="check-in-table-wrapper">
                      <table className="check-in-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Work Item</th>
                            <th>Metadata</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDetails.activities.length === 0 ? (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No activities found</td>
                            </tr>
                          ) : (
                            userDetails.activities.map((activity) => (
                              <tr key={activity.id}>
                                <td>{formatDateTime(activity.created_at)}</td>
                                <td>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    textTransform: 'capitalize',
                                    background: '#e0e7ff',
                                    color: '#3730a3'
                                  }}>
                                    {activity.action_type.replace('_', ' ')}
                                  </span>
                                </td>
                                <td>{activity.work_item_name || '-'}</td>
                                <td style={{ fontSize: '12px', color: '#64748b' }}>
                                  {activity.metadata ? JSON.stringify(activity.metadata).substring(0, 100) : '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="empty-state-card">
              <h3>No data available</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

