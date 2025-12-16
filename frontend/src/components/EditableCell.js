import React, { useState, useEffect, useRef } from 'react';

const EditableCell = ({ 
  item, 
  fieldType, 
  value, 
  onSave, 
  onCancel,
  users = [],
  isEditing,
  cellRef
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value, isEditing]);

  useEffect(() => {
    const cellElement = cellRef?.current;
    if (isEditing && cellElement) {
      const cellRect = cellElement.getBoundingClientRect();
      
      // Position popover below the cell using fixed positioning
      // Check if there's enough space below, otherwise position above
      const spaceBelow = window.innerHeight - cellRect.bottom;
      const spaceAbove = cellRect.top;
      const popoverHeight = 150; // Approximate height
      
      let top, left;
      
      if (spaceBelow >= popoverHeight || spaceBelow > spaceAbove) {
        // Position below
        top = cellRect.bottom + 5;
      } else {
        // Position above
        top = cellRect.top - popoverHeight - 5;
      }
      
      // Adjust horizontal position to stay within viewport
      left = Math.max(10, Math.min(cellRect.left, window.innerWidth - 220));
      
      setPopoverPosition({
        top: top,
        left: left
      });

      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if (inputRef.current.select) {
            inputRef.current.select();
          }
        }
      }, 10);
    }

    // Reposition on scroll/resize
    const handleReposition = () => {
      const cellElement = cellRef?.current;
      if (isEditing && cellElement) {
        const cellRect = cellElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - cellRect.bottom;
        const spaceAbove = cellRect.top;
        const popoverHeight = 150;
        
        let top;
        if (spaceBelow >= popoverHeight || spaceBelow > spaceAbove) {
          top = cellRect.bottom + 5;
        } else {
          top = cellRect.top - popoverHeight - 5;
        }
        
        const left = Math.max(10, Math.min(cellRect.left, window.innerWidth - 220));
        setPopoverPosition({ top, left });
      }
    };

    if (isEditing) {
      window.addEventListener('scroll', handleReposition, true);
      window.addEventListener('resize', handleReposition);
    }

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isEditing]);

  useEffect(() => {
    const cellElement = cellRef?.current;
    const handleClickOutside = (event) => {
      const target = event.target;
      
      // Don't close if clicking on select elements or their options
      if (target.tagName === 'SELECT' || target.tagName === 'OPTION') {
        return;
      }
      
      // Check if click is inside the popover or the cell
      const isInsidePopover = popoverRef.current && popoverRef.current.contains(target);
      const isInsideCell = cellElement && cellElement.contains(target);
      
      // Also check if the click is on a select element that's inside the popover
      const clickedSelect = target.closest('select');
      const isSelectInPopover = clickedSelect && popoverRef.current && popoverRef.current.contains(clickedSelect);
      
      if (
        isEditing &&
        !isInsidePopover &&
        !isInsideCell &&
        !isSelectInPopover
      ) {
        onCancel();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isEditing) {
        onCancel();
      }
    };

    if (isEditing) {
      // Use mouseup instead of mousedown to allow select dropdowns to open first
      document.addEventListener('mouseup', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mouseup', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isEditing, onCancel]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    let processedValue = inputValue;
    
    // Process value based on field type
    if (fieldType === 'videos') {
      processedValue = inputValue === '' ? null : parseInt(inputValue, 10);
      if (isNaN(processedValue)) {
        processedValue = null;
      }
    } else if (fieldType === 'user') {
      processedValue = inputValue === '' ? null : parseInt(inputValue, 10);
    } else if (fieldType === 'description') {
      processedValue = inputValue.trim() || null;
    } else if (fieldType === 'source') {
      processedValue = inputValue || 'other';
    }

    onSave(processedValue);
  };

  const renderInput = () => {
    switch (fieldType) {
      case 'user':
        return (
          <select
            ref={inputRef}
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="field-popover-select"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        );

      case 'source':
        return (
          <select
            ref={inputRef}
            value={inputValue || 'other'}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="field-popover-select"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="other">Other</option>
          </select>
        );

      case 'videos':
        return (
          <input
            ref={inputRef}
            type="number"
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            min="0"
            placeholder="Enter video count"
            className="field-popover-input"
          />
        );

      case 'description':
        return (
          <textarea
            ref={inputRef}
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter description"
            rows="3"
            className="field-popover-textarea"
          />
        );

      default:
        return null;
    }
  };

  if (!isEditing) {
    return null;
  }

  return (
    <div
      ref={popoverRef}
      className="field-popover"
      style={{
        position: 'fixed',
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
        zIndex: 1000
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {renderInput()}
      <div className="field-popover-hint">
        Press Enter to save, Esc to cancel
      </div>
    </div>
  );
};

export default EditableCell;
