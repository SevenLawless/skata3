import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const WorkItemForm = ({ item, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [videoCount, setVideoCount] = useState('');
  const [description, setDescription] = useState('');
  const [checkpoints, setCheckpoints] = useState('');
  const [status, setStatus] = useState('pending');
  const [source, setSource] = useState('other');
  const [error, setError] = useState('');
  const [recurrenceInterval, setRecurrenceInterval] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    // Populate from existing item if editing
    if (item) {
      setName(item.name || '');
      setLink(item.link || '');
      setVideoCount(item.video_count || '');
      setDescription(item.description || '');
      setCheckpoints(item.checkpoints || '');
      setStatus(item.status || 'pending');
      setSource(item.source || 'other');
      setRecurrenceInterval(
        item.recurrence_interval_minutes ? String(item.recurrence_interval_minutes) : ''
      );
      setAssignedUserId(item.assigned_user_id ? String(item.assigned_user_id) : '');
    }
  }, [item]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersAPI.getAll();
        setUsers(response.data || []);
        setUsersError('');
      } catch (err) {
        console.error('Failed to load users', err);
        setUsersError('Failed to load users for assignment');
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!link.trim()) {
      setError('Link is required');
      return;
    }

    // Validate URL
    try {
      new URL(link);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    const formData = {
      name: name.trim(),
      link: link.trim(),
      video_count: videoCount ? parseInt(videoCount) : null,
      description: description.trim() || null,
      checkpoints: checkpoints.trim() || null,
      status: status,
      source: source,
      recurrenceIntervalMinutes: recurrenceInterval ? parseInt(recurrenceInterval, 10) : null,
      assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : null
    };

    onSubmit(formData);
  };

  return (
    <div className="work-item-form-overlay">
      <div className="work-item-form-card">
        <h2>{item ? 'Edit Work Item' : 'Add Work Item'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Work item name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="link">Link *</label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">Source</label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="video_count">Video Count</label>
            <input
              type="number"
              id="video_count"
              value={videoCount}
              onChange={(e) => setVideoCount(e.target.value)}
              min="0"
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label htmlFor="recurrence">Restore Frequency</label>
            <select
              id="recurrence"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(e.target.value)}
            >
              <option value="">No auto-restore</option>
              <option value="1440">Every 1 day</option>
              <option value="2880">Every 2 days</option>
              <option value="4320">Every 3 days</option>
              <option value="10080">Every 1 week</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assigned_user">Assigned User</label>
            {usersError && <div className="error-message small">{usersError}</div>}
            <select
              id="assigned_user"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Optional description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkpoints">Checkpoints</label>
            <textarea
              id="checkpoints"
              value={checkpoints}
              onChange={(e) => setCheckpoints(e.target.value)}
              rows="3"
              placeholder="Optional checkpoints or notes"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={onCancel} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkItemForm;

