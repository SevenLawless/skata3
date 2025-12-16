const WorkItem = require('../models/WorkItem');

const getStats = async (req, res) => {
  try {
    const stats = await WorkItem.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

module.exports = {
  getStats
};

