-- Migration: Add recurrence and assignment fields to work_items table
-- and create activity_logs table for detailed user activity tracking.
-- Run this if you have an existing database.

USE agency_work_db;

-- Add recurrence / assignment columns to work_items
ALTER TABLE work_items 
  ADD COLUMN recurrence_interval_minutes INT NULL AFTER source,
  ADD COLUMN assigned_user_id INT NULL AFTER created_by,
  ADD COLUMN last_restored_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at,
  ADD INDEX idx_recurrence_interval (recurrence_interval_minutes),
  ADD INDEX idx_assigned_user_id (assigned_user_id),
  ADD CONSTRAINT fk_work_items_assigned_user
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  work_item_id INT NULL,
  action_type ENUM('create', 'update', 'status_change', 'assignment_change', 'delete', 'auto_restore') NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_user_id (user_id),
  INDEX idx_activity_work_item_id (work_item_id),
  INDEX idx_activity_action_type (action_type),
  INDEX idx_activity_created_at (created_at),
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_work_item FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE SET NULL
);

