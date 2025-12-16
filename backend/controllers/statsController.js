const ActivityLog = require('../models/ActivityLog');

const getActivity = async (req, res) => {
  try {
    const { userId, actionType, from, to, limit, offset } = req.query;

    const activities = await ActivityLog.findActivities({
      userId: userId ? Number(userId) : undefined,
      actionType: actionType || undefined,
      from: from || undefined,
      to: to || undefined,
      limit: limit ? Number(limit) : 200,
      offset: offset ? Number(offset) : 0
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
};

module.exports = {
  getActivity
};

