-- Create database
CREATE DATABASE IF NOT EXISTS agency_work_db;
USE agency_work_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);

-- Create work_items table
CREATE TABLE IF NOT EXISTS work_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  link VARCHAR(500) NOT NULL,
  video_count INT DEFAULT NULL,
  description TEXT DEFAULT NULL,
  checkpoints TEXT DEFAULT NULL,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  source ENUM('instagram', 'facebook', 'youtube', 'tiktok', 'other') DEFAULT 'other',
  recurrence_interval_minutes INT NULL,
  created_by INT NOT NULL,
  assigned_user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_restored_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at),
  INDEX idx_recurrence_interval (recurrence_interval_minutes),
  INDEX idx_assigned_user_id (assigned_user_id)
);


-- Activity logs table for detailed user actions
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  work_item_id INT NULL,
  action_type ENUM('create', 'update', 'status_change', 'assignment_change', 'delete', 'auto_restore') NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE SET NULL,
  INDEX idx_activity_user_id (user_id),
  INDEX idx_activity_work_item_id (work_item_id),
  INDEX idx_activity_action_type (action_type),
  INDEX idx_activity_created_at (created_at)
);

-- Check-ins table for tracking daily hours
CREATE TABLE IF NOT EXISTS check_ins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  hours DECIMAL(5,2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_checkin_user_date (user_id, check_in_date)
);

