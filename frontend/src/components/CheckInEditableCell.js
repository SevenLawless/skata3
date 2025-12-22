import React, { useState, useEffect, useRef } from 'react';

const CheckInEditableCell = ({ 
  entry, 
  fieldType, 
  value, 
  onSave, 
  onCancel,
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
      const spaceBelow = window.innerHeight - cellRect.bottom;
      const spaceAbove = cellRect.top;
      const popoverHeight = 150;
      
      let top, left;
      
      if (spaceBelow >= popoverHeight || spaceBelow > spaceAbove) {
        top = cellRect.bottom + 5;
      } else {
        top = cellRect.top - popoverHeight - 5;
      }
      
      left = Math.max(10, Math.min(cellRect.left, window.innerWidth - 220));
      
      setPopoverPosition({
        top: top,
        left: left
      });

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if (inputRef.current.select) {
            inputRef.current.select();
          }
        }
      }, 10);
    }

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
  }, [isEditing, cellRef]);

  useEffect(() => {
    const cellElement = cellRef?.current;
    const handleClickOutside = (event) => {
      const target = event.target;
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      const isInsidePopover = popoverRef.current && popoverRef.current.contains(target);
      const isInsideCell = cellElement && cellElement.contains(target);
      
      if (
        isEditing &&
        !isInsidePopover &&
        !isInsideCell
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
      document.addEventListener('mouseup', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mouseup', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isEditing, onCancel, cellRef]);

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
    if (fieldType === 'hours') {
      processedValue = inputValue === '' ? null : parseFloat(inputValue);
      if (isNaN(processedValue)) {
        processedValue = null;
      }
    } else if (fieldType === 'date') {
      processedValue = inputValue || null;
    } else if (fieldType === 'time') {
      processedValue = inputValue || null;
    } else if (fieldType === 'notes') {
      processedValue = inputValue.trim() || null;
    }

    onSave(processedValue);
  };

  const renderInput = () => {
    switch (fieldType) {
      case 'date':
        return (
          <input
            ref={inputRef}
            type="date"
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="field-popover-input"
          />
        );

      case 'startTime':
      case 'endTime':
        return (
          <input
            ref={inputRef}
            type="time"
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="field-popover-input"
          />
        );

      case 'hours':
        return (
          <input
            ref={inputRef}
            type="number"
            step="0.25"
            min="0"
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter hours"
            className="field-popover-input"
          />
        );

      case 'notes':
        return (
          <textarea
            ref={inputRef}
            value={inputValue || ''}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter notes"
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

export default CheckInEditableCell;

