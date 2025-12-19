import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI, usersAPI, dashboardAPI } from '../services/api';

const Statistics = () => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    userId: '',
    actionType: '',
    from: '',
    to: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const getNavClass = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, activityRes, statsRes] = await Promise.all([
        usersAPI.getAll(),
        statsAPI.getActivity({}),
        dashboardAPI.getStats()
      ]);
      setUsers(usersRes.data || []);
      setActivities(activityRes.data.activities || []);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      console.error('Failed to load data', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.actionType) params.actionType = filters.actionType;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await statsAPI.getActivity(params);
      setActivities(res.data.activities || []);
      setError('');
    } catch (err) {
      console.error('Failed to apply filters', err);
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ userId: '', actionType: '', from: '', to: '' });
    fetchData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'create': return '✨';
      case 'update': return '✏️';
      case 'status_change': return '🔄';
      case 'assignment_change': return '👤';
      case 'delete': return '🗑️';
      case 'auto_restore': return '⏰';
      default: return '📋';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'create': return 'action-create';
      case 'update': return 'action-update';
      case 'status_change': return 'action-status';
      case 'assignment_change': return 'action-assign';
      case 'delete': return 'action-delete';
      case 'auto_restore': return 'action-restore';
      default: return '';
    }
  };

  const formatActionType = (actionType) => {
    return actionType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    try {
      const obj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      const parts = [];
      
      if (obj.fromStatus && obj.toStatus) {
        parts.push(
          <span key="status" className="meta-change">
            <span className={`status-mini status-${obj.fromStatus}`}>{obj.fromStatus}</span>
            <span className="arrow">→</span>
            <span className={`status-mini status-${obj.toStatus}`}>{obj.toStatus}</span>
          </span>
        );
      }
      
      if (obj.name && !obj.fromStatus) {
        parts.push(<span key="name" className="meta-item">{obj.name}</span>);
      }
      
      return parts.length > 0 ? parts : null;
    } catch {
      return null;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSummaryStats = () => {
    const today = new Date().toDateString();
    const todayActivities = activities.filter(a => 
      new Date(a.created_at).toDateString() === today
    ).length;
    
    const userCounts = {};
    activities.forEach(a => {
      userCounts[a.user_username] = (userCounts[a.user_username] || 0) + 1;
    });
    const topUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      todayActivities,
      topUser: topUser ? topUser[0] : '-',
      topUserCount: topUser ? topUser[1] : 0
    };
  };

  const summaryStats = getSummaryStats();

  if (loading && !activities.length) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div className="loader"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      {/* Header */}
      <header className="stats-header">
        <div className="header-left">
          <h1 className="logo">WorkHub</h1>
          <nav className="header-nav">
            <button className={getNavClass('/dashboard')} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className={getNavClass('/work-list')} onClick={() => navigate('/work-list')}>
              Work Items
            </button>
            <button className={getNavClass('/check-in')} onClick={() => navigate('/check-in')}>
              Check-In
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user?.username}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="stats-main">
        {/* Summary Cards */}
        <section className="summary-section">
          <div className="summary-card gradient-1">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <span className="summary-value">{stats?.total || 0}</span>
              <span className="summary-label">Total Items</span>
            </div>
          </div>
          
          <div className="summary-card gradient-2">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <span className="summary-value">{stats?.completionRate || 0}%</span>
              <span className="summary-label">Completion Rate</span>
            </div>
          </div>
          
          <div className="summary-card gradient-3">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <span className="summary-value">{summaryStats.todayActivities}</span>
              <span className="summary-label">Actions Today</span>
            </div>
          </div>
          
          <div className="summary-card gradient-4">
            <div className="summary-icon">👑</div>
            <div className="summary-content">
              <span className="summary-value">{summaryStats.topUser}</span>
              <span className="summary-label">Most Active</span>
            </div>
          </div>
        </section>

        {/* Status Overview */}
        <section className="status-overview">
          <div className="status-item">
            <span className="status-dot pending"></span>
            <span className="status-count">{stats?.statusBreakdown?.pending || 0}</span>
            <span className="status-label">Pending</span>
          </div>
          <div className="status-item">
            <span className="status-dot in-progress"></span>
            <span className="status-count">{stats?.statusBreakdown?.in_progress || 0}</span>
            <span className="status-label">In Progress</span>
          </div>
          <div className="status-item">
            <span className="status-dot completed"></span>
            <span className="status-count">{stats?.statusBreakdown?.completed || 0}</span>
            <span className="status-label">Completed</span>
          </div>
        </section>

        {/* Filters */}
        <section className="filters-section">
          <div className="filters-header">
            <h2>Activity Feed</h2>
            <span className="activity-count">{activities.length} activities</span>
          </div>
          
          <form onSubmit={applyFilters} className="filters-form">
            <div className="filter-group">
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                name="actionType"
                value={filters.actionType}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="status_change">Status Change</option>
                <option value="assignment_change">Assignment</option>
                <option value="delete">Delete</option>
                <option value="auto_restore">Auto Restore</option>
              </select>
            </div>

            <div className="filter-group">
              <input
                type="date"
                name="from"
                value={filters.from}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="From"
              />
            </div>

            <div className="filter-group">
              <input
                type="date"
                name="to"
                value={filters.to}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="To"
              />
            </div>

            <div className="filter-actions">
              <button type="submit" className="filter-btn primary">Apply</button>
              <button type="button" onClick={clearFilters} className="filter-btn secondary">Clear</button>
            </div>
          </form>
        </section>

        {error && <div className="error-banner">{error}</div>}

        {/* Activity Timeline */}
        <section className="activity-section">
          {loading ? (
            <div className="loading-inline">
              <div className="loader small"></div>
              <span>Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-icon">📭</div>
              <h3>No Activity Found</h3>
              <p>No activities match your current filters. Try adjusting the filters or check back later.</p>
            </div>
          ) : (
            <div className="activity-timeline">
              {activities.map((activity) => (
                <div key={activity.id} className={`activity-card ${getActionColor(activity.action_type)}`}>
                  <div className="activity-icon">
                    {getActionIcon(activity.action_type)}
                  </div>
                  <div className="activity-body">
                    <div className="activity-top">
                      <span className="activity-user">{activity.user_username}</span>
                      <span className="activity-action">{formatActionType(activity.action_type)}</span>
                      {activity.work_item_name && (
                        <span className="activity-item-name">"{activity.work_item_name}"</span>
                      )}
                    </div>
                    {formatMetadata(activity.metadata) && (
                      <div className="activity-meta">
                        {formatMetadata(activity.metadata)}
                      </div>
                    )}
                  </div>
                  <div className="activity-time">
                    {formatTimeAgo(activity.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Statistics;
