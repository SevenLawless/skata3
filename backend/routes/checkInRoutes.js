const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkInController = require('../controllers/checkInController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', checkInController.listCheckIns);
router.post('/', checkInController.createCheckIn);

module.exports = router;

