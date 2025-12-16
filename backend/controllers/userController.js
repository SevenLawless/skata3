const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAllBasic();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

module.exports = {
  getAllUsers
};

