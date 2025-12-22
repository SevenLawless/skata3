const User = require('../models/User');
const CheckIn = require('../models/CheckIn');
const ActivityLog = require('../models/ActivityLog');
const WorkItem = require('../models/WorkItem');

const ADMIN_PASSWORD = 'adminpassword';

const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      res.json({ verified: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Verify password error:', error);
    res.status(500).json({ error: 'Failed to verify password' });
  }
};

const getAllUsersData = async (req, res) => {
  try {
    const { period = 'month', from, to } = req.query;
    
    // Calculate date range
    let range = {};
    const now = new Date();
    
    if (period === 'custom' && from && to) {
      range = { from, to };
    } else if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      range.from = weekStart.toISOString().split('T')[0];
      range.to = now.toISOString().split('T')[0];
    } else {
      // Default to month
      range.from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      range.to = now.toISOString().split('T')[0];
    }

    const users = await User.findAllBasic();
    
    const usersWithData = await Promise.all(
      users.map(async (user) => {
        // Get check-in data
        const totalHours = await CheckIn.sumHoursByRange(user.id, range);
        const totalVideosFromCheckIns = await CheckIn.sumVideoCountByRange(user.id, range);
        const checkIns = await CheckIn.findByUserRange(user.id, { ...range, limit: 500 });
        
        // Get work items created by user
        const workItems = await WorkItem.findAll();
        const userWorkItems = workItems.filter(wi => wi.created_by === user.id);
        const totalVideosFromWorkItems = userWorkItems.reduce((sum, wi) => {
          return sum + (wi.video_count || 0);
        }, 0);
        
        // Get activity logs
        const activities = await ActivityLog.findActivities({
          userId: user.id,
          from: range.from,
          to: range.to,
          limit: 100
        });
        
        // Get last activity timestamp
        const lastActivity = activities.length > 0 
          ? activities[0].created_at 
          : null;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
          stats: {
            totalHours: Number(totalHours.toFixed(2)),
            totalVideosFromCheckIns: totalVideosFromCheckIns,
            totalVideosFromWorkItems: totalVideosFromWorkItems,
            totalVideos: totalVideosFromCheckIns + totalVideosFromWorkItems,
            checkInCount: checkIns.length,
            workItemCount: userWorkItems.length,
            activityCount: activities.length,
            lastActivity: lastActivity
          },
          checkIns: checkIns.slice(0, 50), // Limit to 50 most recent
          workItems: userWorkItems.slice(0, 50), // Limit to 50 most recent
          activities: activities.slice(0, 50) // Limit to 50 most recent
        };
      })
    );

    // Calculate totals
    const totals = {
      totalHours: usersWithData.reduce((sum, u) => sum + u.stats.totalHours, 0),
      totalVideos: usersWithData.reduce((sum, u) => sum + u.stats.totalVideos, 0),
      totalCheckIns: usersWithData.reduce((sum, u) => sum + u.stats.checkInCount, 0),
      totalWorkItems: usersWithData.reduce((sum, u) => sum + u.stats.workItemCount, 0)
    };

    res.json({
      period: range,
      totals,
      users: usersWithData
    });
  } catch (error) {
    console.error('Get all users data error:', error);
    res.status(500).json({ error: 'Failed to fetch users data' });
  }
};

const getUserDetailedData = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'month', from, to } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate date range
    let range = {};
    const now = new Date();
    
    if (period === 'custom' && from && to) {
      range = { from, to };
    } else if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      range.from = weekStart.toISOString().split('T')[0];
      range.to = now.toISOString().split('T')[0];
    } else {
      range.from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      range.to = now.toISOString().split('T')[0];
    }

    // Get all check-ins
    const checkIns = await CheckIn.findByUserRange(userId, { ...range, limit: 1000 });
    const totalHours = await CheckIn.sumHoursByRange(userId, range);
    const totalVideosFromCheckIns = await CheckIn.sumVideoCountByRange(userId, range);

    // Get all work items
    const allWorkItems = await WorkItem.findAll();
    const userWorkItems = allWorkItems.filter(wi => wi.created_by === userId);
    const totalVideosFromWorkItems = userWorkItems.reduce((sum, wi) => {
      return sum + (wi.video_count || 0);
    }, 0);

    // Get all activity logs
    const activities = await ActivityLog.findActivities({
      userId: Number(userId),
      from: range.from,
      to: range.to,
      limit: 500
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      period: range,
      hours: {
        total: Number(totalHours.toFixed(2)),
        checkIns: checkIns
      },
      videos: {
        fromCheckIns: totalVideosFromCheckIns,
        fromWorkItems: totalVideosFromWorkItems,
        total: totalVideosFromCheckIns + totalVideosFromWorkItems
      },
      workItems: userWorkItems,
      activities: activities
    });
  } catch (error) {
    console.error('Get user detailed data error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

module.exports = {
  verifyPassword,
  getAllUsersData,
  getUserDetailedData
};

