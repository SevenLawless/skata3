import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkInsAPI } from '../services/api';
import CheckInEditableCell from './CheckInEditableCell';

const formatTime = (value) => {
  if (!value) return '-';
  return value.slice(0, 5);
};

const formatDate = (value) => {
  if (!value) return '-';
  return value.split('T')[0];
};

const periodOptions = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' }
];

const CheckIn = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const getNavClass = (path) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today,
    startTime: '',
    endTime: '',
    hours: '',
    videoCount: '',
    notes: ''
  });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [period, setPeriod] = useState('week');
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const [summary, setSummary] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { entryId, field }
  const cellRefs = useRef({});

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params = { period, limit: 100 };
      if (period === 'custom') {
        params.from = customFrom;
        params.to = customTo;
      }
      const res = await checkInsAPI.list(params);
      setEntries(res.data.entries || []);
      setSummary(res.data.summary || null);
      setError('');
    } catch (err) {
      console.error('Failed to load check-ins', err);
      setError(err.response?.data?.error || 'Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const derivedHours = useMemo(() => {
    if (!form.startTime || !form.endTime) return null;
    const day = form.date || today;
    const start = new Date(`${day}T${form.startTime}`);
    let end = new Date(`${day}T${form.endTime}`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    let diff = (end - start) / 3600000;
    if (diff <= 0) {
      end = new Date(end);
      end.setDate(end.getDate() + 1);
      diff = (end - start) / 3600000;
    }

    return Number(diff.toFixed(2));
  }, [form.date, form.startTime, form.endTime, today]);

  const totalHours = useMemo(
    () =>
      entries.reduce((sum, entry) => {
        const value = Number(entry.hours) || 0;
        return sum + value;
      }, 0),
    [entries]
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    let parsedHours = form.hours ? parseFloat(form.hours) : null;
    if (Number.isNaN(parsedHours)) {
      parsedHours = null;
    }

    if (!parsedHours) {
      parsedHours = derivedHours;
    }

    if (!parsedHours || parsedHours <= 0) {
      setError('Provide total hours or a valid start and end time.');
      return;
    }

    try {
      setSaving(true);
      const parsedVideoCount = form.videoCount ? parseInt(form.videoCount, 10) : null;
      
      await checkInsAPI.create({
        date: form.date,
        start_time: form.startTime || null,
        end_time: form.endTime || null,
        hours: Number(parsedHours.toFixed(2)),
        video_count: parsedVideoCount && !isNaN(parsedVideoCount) ? parsedVideoCount : null,
        notes: form.notes.trim() || null
      });
      setSuccess('Check-in logged successfully.');
      setForm((prev) => ({
        ...prev,
        startTime: '',
        endTime: '',
        hours: '',
        videoCount: '',
        notes: ''
      }));
      fetchEntries();
    } catch (err) {
      console.error('Failed to save check-in', err);
      setError(err.response?.data?.error || 'Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this check-in entry? This cannot be undone.')) {
      return;
    }

    setError('');
    setSuccess('');
    setDeletingId(entryId);

    try {
      await checkInsAPI.remove(entryId);
      setSuccess('Check-in entry deleted.');
      fetchEntries();
    } catch (err) {
      console.error('Failed to delete check-in', err);
      setError(err.response?.data?.error || 'Failed to delete check-in');
    } finally {
      setDeletingId(null);
    }
  };
  const handlePeriodChange = (value) => {
    setPeriod(value);
    setError('');
    setSuccess('');
  };
  const handleCustomRangeChange = (field) => (event) => {
    const setter = field === 'from' ? setCustomFrom : setCustomTo;
    setter(event.target.value);
    setError('');
    setSuccess('');
  };

  const calculateHoursFromTimes = (date, startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const start = new Date(`${date}T${startTime}`);
    let end = new Date(`${date}T${endTime}`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    let diff = (end - start) / 3600000;
    if (diff <= 0) {
      end = new Date(end);
      end.setDate(end.getDate() + 1);
      diff = (end - start) / 3600000;
    }

    return Number(diff.toFixed(2));
  };

  const handleCellClick = (entryId, field, event) => {
    // Don't trigger edit if clicking on a button or inside an action cell
    if (event && (event.target.tagName === 'BUTTON' || event.target.closest('button'))) {
      return;
    }
    setEditingCell({ entryId, field });
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleCellSave = async (entryId, field, value) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    setError('');
    setSuccess('');

    try {
      const updateData = {};
      
      if (field === 'date') {
        updateData.date = value;
        // Recalculate hours if times exist
        if (entry.start_time && entry.end_time) {
          const calculatedHours = calculateHoursFromTimes(value, entry.start_time, entry.end_time);
          if (calculatedHours) {
            updateData.hours = calculatedHours;
          }
        }
      } else if (field === 'startTime') {
        updateData.start_time = value;
        // Recalculate hours if end time exists
        const checkInDate = entry.check_in_date;
        if (value && entry.end_time) {
          const calculatedHours = calculateHoursFromTimes(checkInDate, value, entry.end_time);
          if (calculatedHours) {
            updateData.hours = calculatedHours;
          }
        }
      } else if (field === 'endTime') {
        updateData.end_time = value;
        // Recalculate hours if start time exists
        const checkInDate = entry.check_in_date;
        if (value && entry.start_time) {
          const calculatedHours = calculateHoursFromTimes(checkInDate, entry.start_time, value);
          if (calculatedHours) {
            updateData.hours = calculatedHours;
          }
        }
      } else if (field === 'hours') {
        updateData.hours = value;
      } else if (field === 'videoCount') {
        updateData.video_count = value !== null && value !== '' ? parseInt(value, 10) : null;
      } else if (field === 'notes') {
        updateData.notes = value;
      }

      await checkInsAPI.update(entryId, updateData);
      setSuccess('Check-in updated successfully.');
      setEditingCell(null);
      fetchEntries();
    } catch (err) {
      console.error('Failed to update check-in', err);
      setError(err.response?.data?.error || 'Failed to update check-in');
    }
  };

  const getCellRef = (entryId, field) => {
    const key = `${entryId}-${field}`;
    if (!cellRefs.current[key]) {
      cellRefs.current[key] = React.createRef();
    }
    return cellRefs.current[key];
  };

  return (
    <div className="stats-page">
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
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="stats-main">
        <div className="check-in-grid">
          <section className="check-in-form-card">
            <h2>Clock-In</h2>
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="checkin-date">Date</label>
                <input
                  type="date"
                  id="checkin-date"
                  value={form.date}
                  onChange={handleChange('date')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="start-time">Start Time</label>
                <input
                  type="time"
                  id="start-time"
                  value={form.startTime}
                  onChange={handleChange('startTime')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-time">End Time</label>
                <input
                  type="time"
                  id="end-time"
                  value={form.endTime}
                  onChange={handleChange('endTime')}
                />
              </div>

              {derivedHours && !form.hours && (
                <p className="check-in-hint">Derived hours: {derivedHours}h from start/end</p>
              )}

              <div className="form-group">
                <label htmlFor="hours">Total Hours</label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  id="hours"
                  value={form.hours}
                  onChange={handleChange('hours')}
                  placeholder="Use if you prefer to type hours"
                />
              </div>

              <div className="form-group">
                <label htmlFor="video-count">Videos Extracted</label>
                <input
                  type="number"
                  min="0"
                  id="video-count"
                  value={form.videoCount}
                  onChange={handleChange('videoCount')}
                  placeholder="Number of videos extracted"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={handleChange('notes')}
                  rows="3"
                  placeholder="Optional note about the session"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Log Hours'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      startTime: '',
                      endTime: '',
                      hours: '',
                      videoCount: '',
                      notes: ''
                    }))
                  }
                  disabled={saving}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>

          <section className="check-in-table-card">
            <div className="check-in-period-selector">
              {periodOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`period-btn ${period === option.id ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {period === 'custom' && (
              <div className="custom-range-inputs">
                <div className="form-group">
                  <label htmlFor="custom-from">From</label>
                  <input
                    type="date"
                    id="custom-from"
                    value={customFrom}
                    max={customTo}
                    onChange={handleCustomRangeChange('from')}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="custom-to">To</label>
                  <input
                    type="date"
                    id="custom-to"
                    value={customTo}
                    min={customFrom}
                    onChange={handleCustomRangeChange('to')}
                  />
                </div>
              </div>
            )}
            <div className="check-in-table-header">
              <h2>Your Check-Ins</h2>
              <span className="check-in-summary">
                {summary
                  ? `${Number(summary.totalHours).toFixed(2)} hrs (${summary.label})`
                  : `${totalHours.toFixed(2)} total logged hrs`}
              </span>
            </div>
            {summary && (
              <div className="check-in-period-summary">
                <div>
                  <strong>{summary.label}</strong>
                  <p>
                    {summary.from} → {summary.to}
                  </p>
                </div>
                <div className="check-in-period-summary-value">
                  {Number(summary.totalHours).toFixed(2)} hrs
                </div>
              </div>
            )}
            {loading ? (
              <p>Loading entries...</p>
            ) : entries.length === 0 ? (
              <p>No check-ins yet. Log your hours to get started.</p>
            ) : (
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td 
                          ref={getCellRef(entry.id, 'date')}
                          className="check-in-cell-editable"
                          onClick={(e) => handleCellClick(entry.id, 'date', e)}
                        >
                          {formatDate(entry.check_in_date)}
                          <CheckInEditableCell
                            entry={entry}
                            fieldType="date"
                            value={entry.check_in_date}
                            onSave={(value) => handleCellSave(entry.id, 'date', value)}
                            onCancel={handleCellCancel}
                            isEditing={editingCell?.entryId === entry.id && editingCell?.field === 'date'}
                            cellRef={getCellRef(entry.id, 'date')}
                          />
                        </td>
                        <td 
                          ref={getCellRef(entry.id, 'startTime')}
                          className="check-in-cell-editable"
                          onClick={(e) => handleCellClick(entry.id, 'startTime', e)}
                        >
                          {formatTime(entry.start_time)}
                          <CheckInEditableCell
                            entry={entry}
                            fieldType="startTime"
                            value={entry.start_time}
                            onSave={(value) => handleCellSave(entry.id, 'startTime', value)}
                            onCancel={handleCellCancel}
                            isEditing={editingCell?.entryId === entry.id && editingCell?.field === 'startTime'}
                            cellRef={getCellRef(entry.id, 'startTime')}
                          />
                        </td>
                        <td 
                          ref={getCellRef(entry.id, 'endTime')}
                          className="check-in-cell-editable"
                          onClick={(e) => handleCellClick(entry.id, 'endTime', e)}
                        >
                          {formatTime(entry.end_time)}
                          <CheckInEditableCell
                            entry={entry}
                            fieldType="endTime"
                            value={entry.end_time}
                            onSave={(value) => handleCellSave(entry.id, 'endTime', value)}
                            onCancel={handleCellCancel}
                            isEditing={editingCell?.entryId === entry.id && editingCell?.field === 'endTime'}
                            cellRef={getCellRef(entry.id, 'endTime')}
                          />
                        </td>
                        <td 
                          ref={getCellRef(entry.id, 'hours')}
                          className="check-in-cell-editable"
                          onClick={(e) => handleCellClick(entry.id, 'hours', e)}
                        >
                          {Number(entry.hours).toFixed(2)}
                          <CheckInEditableCell
                            entry={entry}
                            fieldType="hours"
                            value={entry.hours}
                            onSave={(value) => handleCellSave(entry.id, 'hours', value)}
                            onCancel={handleCellCancel}
                            isEditing={editingCell?.entryId === entry.id && editingCell?.field === 'hours'}
                            cellRef={getCellRef(entry.id, 'hours')}
                          />
                        </td>
                        <td 
                          ref={getCellRef(entry.id, 'videoCount')}
                          className="check-in-cell-editable"
                          onClick={(e) => handleCellClick(entry.id, 'videoCount', e)}
                        >
                          {entry.video_count !== null && entry.video_count !== undefined ? entry.video_count : '-'}
                          <CheckInEditableCell
                            entry={entry}
                            fieldType="videoCount"
                            value={entry.video_count}
                            onSave={(value) => handleCellSave(entry.id, 'videoCount', value)}
                            onCancel={handleCellCancel}
                            isEditing={editingCell?.entryId === entry.id && editingCell?.field === 'videoCount'}
                            cellRef={getCellRef(entry.id, 'videoCount')}
                          />
                        </td>
                        <td 
                          ref={getCellRef(entry.id, 'notes')}
                          className="check-in-cell-editable"
                          onClick={(e) => handleCellClick(entry.id, 'notes', e)}
                        >
                          {entry.notes || '-'}
                          <CheckInEditableCell
                            entry={entry}
                            fieldType="notes"
                            value={entry.notes}
                            onSave={(value) => handleCellSave(entry.id, 'notes', value)}
                            onCancel={handleCellCancel}
                            isEditing={editingCell?.entryId === entry.id && editingCell?.field === 'notes'}
                            cellRef={getCellRef(entry.id, 'notes')}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default CheckIn;

