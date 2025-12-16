const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getActivity } = require('../controllers/statsController');

router.get('/activity', authMiddleware, getActivity);

module.exports = router;

