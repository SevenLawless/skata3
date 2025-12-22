const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Password verification endpoint (no auth required)
router.post('/verify', adminController.verifyPassword);

// Admin data endpoints (password should be verified on frontend, but we can add session check if needed)
router.get('/users/all', adminController.getAllUsersData);
router.get('/users/:userId', adminController.getUserDetailedData);

module.exports = router;

