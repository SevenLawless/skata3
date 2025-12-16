import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workItemsAPI, usersAPI } from '../services/api';
import WorkItemForm from './WorkItemForm';
import EditableCell from './EditableCell';

const WorkList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingField, setEditingField] = useState(null); // { itemId, fieldType }
  const [users, setUsers] = useState([]);
  const [savingField, setSavingField] = useState(null); // Track which field is being saved
  const cellRefs = useRef({}); // Store refs for each editable cell
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkItems();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const fetchWorkItems = async () => {
    try {
      const response = await workItemsAPI.getAll();
      setItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load work items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await workItemsAPI.update(editingItem.id, formData);
      } else {
        await workItemsAPI.create(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      fetchWorkItems();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save work item');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work item?')) {
      try {
        await workItemsAPI.delete(id);
        fetchWorkItems();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete work item');
        console.error(err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFieldClick = (itemId, fieldType, event) => {
    // Prevent event bubbling
    event?.stopPropagation();
    
    // Close any existing editing
    if (editingField && editingField.itemId === itemId && editingField.fieldType === fieldType) {
      setEditingField(null);
      return;
    }

    setEditingField({ itemId, fieldType });
  };

  const handleFieldSave = async (itemId, fieldType, newValue) => {
    setSavingField({ itemId, fieldType });
    
    try {
      // Find the current item to get all its data
      const currentItem = items.find(item => item.id === itemId);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Prepare update data
      const updateData = {
        name: currentItem.name,
        link: currentItem.link,
        video_count: currentItem.video_count,
        description: currentItem.description,
        checkpoints: currentItem.checkpoints,
        status: currentItem.status,
        source: currentItem.source || 'other',
        recurrenceIntervalMinutes: currentItem.recurrence_interval_minutes,
        assignedUserId: currentItem.assigned_user_id
      };

      // Update the specific field
      if (fieldType === 'user') {
        updateData.assignedUserId = newValue;
      } else if (fieldType === 'source') {
        updateData.source = newValue;
      } else if (fieldType === 'videos') {
        updateData.video_count = newValue;
      } else if (fieldType === 'description') {
        updateData.description = newValue;
      }

      await workItemsAPI.update(itemId, updateData);
      
      // Refresh the items list
      await fetchWorkItems();
      
      // Close the editing popover
      setEditingField(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || `Failed to update ${fieldType}`);
      console.error('Field update error:', err);
    } finally {
      setSavingField(null);
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group items by status: in_progress, pending, completed
  const groupedItems = {
    in_progress: filteredItems.filter(item => item.status === 'in_progress'),
    pending: filteredItems.filter(item => item.status === 'pending'),
    completed: filteredItems.filter(item => item.status === 'completed')
  };

  const formatSource = (source) => {
    if (!source) return 'Other';
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  const renderEditableCell = (item, fieldType, displayValue, cellContent) => {
    const cellKey = `${item.id}-${fieldType}`;
    const cellRefCallback = (element) => {
      if (element) {
        cellRefs.current[cellKey] = element;
      } else {
        delete cellRefs.current[cellKey];
      }
    };
    // Create a ref-like object that EditableCell can use
    const cellRef = {
      get current() {
        return cellRefs.current[cellKey] || null;
      }
    };
    const isEditing = editingField?.itemId === item.id && editingField?.fieldType === fieldType;
    const isSaving = savingField?.itemId === item.id && savingField?.fieldType === fieldType;

    let fieldValue;
    if (fieldType === 'user') {
      fieldValue = item.assigned_user_id ? String(item.assigned_user_id) : '';
    } else if (fieldType === 'source') {
      fieldValue = item.source || 'other';
    } else if (fieldType === 'videos') {
      fieldValue = item.video_count !== null ? String(item.video_count) : '';
    } else if (fieldType === 'description') {
      fieldValue = item.description || '';
    }

    return (
      <td
        key={cellKey}
        ref={cellRefCallback}
        className="editable-cell"
        onClick={(e) => handleFieldClick(item.id, fieldType, e)}
        style={{ position: 'relative' }}
      >
        {isSaving ? (
          <span style={{ color: '#667eea' }}>Saving...</span>
        ) : (
          <>
            {cellContent}
            <EditableCell
              item={item}
              fieldType={fieldType}
              value={fieldValue}
              onSave={(value) => handleFieldSave(item.id, fieldType, value)}
              onCancel={handleFieldCancel}
              users={users}
              isEditing={isEditing}
              cellRef={cellRef}
            />
          </>
        )}
      </td>
    );
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div className="loader"></div>
          <p>Loading work items...</p>
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
            <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-link active">Work Items</button>
          </nav>
        </div>
        <div className="header-right">
          <button onClick={handleCreate} className="btn btn-primary" style={{ marginRight: '10px' }}>
            + Add Item
          </button>
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user?.username}</span>
          </div>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <main className="stats-main">
        <div className="work-list-content">

          {error && <div className="error-banner">{error}</div>}

          <div className="worklist-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, link, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="work-items-table-container">
        {filteredItems.length > 0 ? (
          <>
            {groupedItems.in_progress.length > 0 && (
              <div className="status-group">
                <h2 className="status-group-header">In Progress</h2>
                <table className="work-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Videos</th>
                      <th>User</th>
                      <th>Source</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems.in_progress.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.name || '-'}</td>
                        <td>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="table-link">
                            {truncateText(item.link, 40)}
                          </a>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        {renderEditableCell(
                          item,
                          'videos',
                          item.video_count,
                          <span>{item.video_count !== null ? item.video_count : '-'}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'user',
                          item.assigned_user_id,
                          <span>{item.assigned_username || 'Unassigned'}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'source',
                          item.source,
                          <span>{formatSource(item.source)}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'description',
                          item.description,
                          <span title={item.description || ''}>{truncateText(item.description, 50)}</span>
                        )}
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {groupedItems.pending.length > 0 && (
              <div className="status-group">
                <h2 className="status-group-header">Pending</h2>
                <table className="work-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Videos</th>
                      <th>User</th>
                      <th>Source</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems.pending.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.name || '-'}</td>
                        <td>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="table-link">
                            {truncateText(item.link, 40)}
                          </a>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        {renderEditableCell(
                          item,
                          'videos',
                          item.video_count,
                          <span>{item.video_count !== null ? item.video_count : '-'}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'user',
                          item.assigned_user_id,
                          <span>{item.assigned_username || 'Unassigned'}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'source',
                          item.source,
                          <span>{formatSource(item.source)}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'description',
                          item.description,
                          <span title={item.description || ''}>{truncateText(item.description, 50)}</span>
                        )}
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {groupedItems.completed.length > 0 && (
              <div className="status-group">
                <h2 className="status-group-header">Completed</h2>
                <table className="work-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Link</th>
                      <th>Status</th>
                      <th>Videos</th>
                      <th>User</th>
                      <th>Source</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems.completed.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.name || '-'}</td>
                        <td>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="table-link">
                            {truncateText(item.link, 40)}
                          </a>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        {renderEditableCell(
                          item,
                          'videos',
                          item.video_count,
                          <span>{item.video_count !== null ? item.video_count : '-'}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'user',
                          item.assigned_user_id,
                          <span>{item.assigned_username || 'Unassigned'}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'source',
                          item.source,
                          <span>{formatSource(item.source)}</span>
                        )}
                        {renderEditableCell(
                          item,
                          'description',
                          item.description,
                          <span title={item.description || ''}>{truncateText(item.description, 50)}</span>
                        )}
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleEdit(item)} className="btn btn-sm btn-secondary">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-danger">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No work items found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Create your first work item!'}</p>
          </div>
        )}
      </div>

        {showForm && (
          <WorkItemForm
            item={editingItem}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}
        </div>
      </main>
    </div>
  );
};

export default WorkList;

