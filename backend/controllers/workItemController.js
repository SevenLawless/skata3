const WorkItem = require('../models/WorkItem');
const ActivityLog = require('../models/ActivityLog');
const { validationResult } = require('express-validator');

const getAllWorkItems = async (req, res) => {
  try {
    const items = await WorkItem.findAll();
    res.json(items);
  } catch (error) {
    console.error('Get work items error:', error);
    res.status(500).json({ error: 'Failed to fetch work items' });
  }
};

const getWorkItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await WorkItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Work item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get work item error:', error);
    res.status(500).json({ error: 'Failed to fetch work item' });
  }
};

const createWorkItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ error: errorMessages, errors: errors.array() });
    }

    const {
      name,
      link,
      video_count,
      description,
      checkpoints,
      status,
      source,
      recurrenceIntervalMinutes,
      assignedUserId
    } = req.body;
    const createdBy = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Ensure link has protocol
    let formattedLink = link.trim();
    if (!formattedLink.match(/^https?:\/\//i)) {
      formattedLink = 'https://' + formattedLink;
    }
    const itemId = await WorkItem.create(
      name.trim(),
      formattedLink,
      video_count,
      description,
      checkpoints,
      source,
      createdBy,
      recurrenceIntervalMinutes,
      assignedUserId
    );
    const item = await WorkItem.findById(itemId);

    // Log creation activity
    await ActivityLog.log(createdBy, itemId, 'create', {
      name: item.name,
      status: item.status,
      assignedUserId: item.assigned_user_id || null,
      recurrenceIntervalMinutes: item.recurrence_interval_minutes || null
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create work item error:', error);
    res.status(500).json({ error: 'Failed to create work item' });
  }
};

const updateWorkItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({ error: errorMessages, errors: errors.array() });
    }

    const { id } = req.params;
    let {
      name,
      link,
      video_count,
      description,
      checkpoints,
      status,
      source,
      recurrenceIntervalMinutes,
      assignedUserId
    } = req.body;

    const existingItem = await WorkItem.findById(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Work item not found' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Ensure link has protocol
    if (link) {
      link = link.trim();
      if (!link.match(/^https?:\/\//i)) {
        link = 'https://' + link;
      }
    }

    const updatedItem = await WorkItem.update(
      id,
      name.trim(),
      link,
      video_count,
      description,
      checkpoints,
      status,
      source,
      recurrenceIntervalMinutes,
      assignedUserId
    );

    // Log update activities
    const userId = req.userId;
    const metadataBase = {
      name: updatedItem.name,
      workItemId: updatedItem.id
    };

    // Generic update log
    await ActivityLog.log(userId, updatedItem.id, 'update', {
      ...metadataBase
    });

    // Status change log
    if (existingItem.status !== updatedItem.status) {
      await ActivityLog.log(userId, updatedItem.id, 'status_change', {
        ...metadataBase,
        fromStatus: existingItem.status,
        toStatus: updatedItem.status
      });
    }

    // Assignment change log
    if (existingItem.assigned_user_id !== updatedItem.assigned_user_id) {
      await ActivityLog.log(userId, updatedItem.id, 'assignment_change', {
        ...metadataBase,
        fromAssignedUserId: existingItem.assigned_user_id || null,
        toAssignedUserId: updatedItem.assigned_user_id || null
      });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Update work item error:', error);
    res.status(500).json({ error: 'Failed to update work item' });
  }
};

const deleteWorkItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await WorkItem.findById(id);
    const deleted = await WorkItem.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Work item not found' });
    }

    if (existingItem) {
      await ActivityLog.log(req.userId, existingItem.id, 'delete', {
        name: existingItem.name,
        status: existingItem.status,
        assignedUserId: existingItem.assigned_user_id || null
      });
    }

    res.json({ message: 'Work item deleted successfully' });
  } catch (error) {
    console.error('Delete work item error:', error);
    res.status(500).json({ error: 'Failed to delete work item' });
  }
};

module.exports = {
  getAllWorkItems,
  getWorkItemById,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem
};

