const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllWorkItems,
  getWorkItemById,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem
} = require('../controllers/workItemController');

const validateWorkItem = [
  body('link')
    .trim()
    .notEmpty()
    .withMessage('Link is required')
    .custom((value) => {
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!urlPattern.test(value)) {
        throw new Error('Please provide a valid URL');
      }
      return true;
    }),
  body('video_count')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Video count must be a non-negative integer');
      }
      return true;
    }),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('checkpoints')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status must be pending, in_progress, or completed')
];

router.get('/', authMiddleware, getAllWorkItems);
router.get('/:id', authMiddleware, getWorkItemById);
router.post('/', authMiddleware, validateWorkItem, createWorkItem);
router.put('/:id', authMiddleware, validateWorkItem, updateWorkItem);
router.delete('/:id', authMiddleware, deleteWorkItem);

module.exports = router;

