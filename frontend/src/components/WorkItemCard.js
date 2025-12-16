import React from 'react';

const WorkItemCard = ({ item, onEdit, onDelete }) => {
  const renderRecurrenceLabel = () => {
    const minutes = item.recurrence_interval_minutes;
    if (!minutes) return null;

    switch (minutes) {
      case 1440:
        return 'Every 1 day';
      case 2880:
        return 'Every 2 days';
      case 4320:
        return 'Every 3 days';
      case 10080:
        return 'Every 1 week';
      default:
        return `Every ${Math.round(minutes / 1440)} day(s)`;
    }
  };

  return (
    <div className="work-item-card">
      <div className="work-item-header">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="work-item-link"
        >
          {item.link}
        </a>
        <span className={`status-badge status-${item.status}`}>
          {item.status.replace('_', ' ')}
        </span>
      </div>

      <div className="work-item-body">
        {item.video_count !== null && (
          <div className="work-item-info">
            <strong>Videos:</strong> {item.video_count}
          </div>
        )}

        {item.description && (
          <div className="work-item-description">
            <strong>Description:</strong>
            <p>{item.description}</p>
          </div>
        )}

        {item.checkpoints && (
          <div className="work-item-checkpoints">
            <strong>Checkpoints:</strong>
            <p>{item.checkpoints}</p>
          </div>
        )}

        <div className="work-item-meta">
          <span>Created by {item.created_by_username}</span>
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>

        <div className="work-item-meta">
          {item.assigned_username && (
            <span>Assigned to {item.assigned_username}</span>
          )}
          {renderRecurrenceLabel() && (
            <span>Restore: {renderRecurrenceLabel()}</span>
          )}
        </div>
      </div>

      <div className="work-item-actions">
        <button onClick={() => onEdit(item)} className="btn btn-sm btn-secondary">
          Edit
        </button>
        <button onClick={() => onDelete(item.id)} className="btn btn-sm btn-danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default WorkItemCard;

