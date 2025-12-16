-- Migration: Add name and source fields to work_items table
-- Run this if you have an existing database

USE agency_work_db;

-- Add name column (required, so we'll set a default for existing rows)
ALTER TABLE work_items 
ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Untitled' AFTER id;

-- Add source column
ALTER TABLE work_items 
ADD COLUMN source ENUM('instagram', 'facebook', 'youtube', 'tiktok', 'other') DEFAULT 'other' AFTER status;

-- Remove the default from name column after migration (optional, but recommended)
-- ALTER TABLE work_items ALTER COLUMN name DROP DEFAULT;

