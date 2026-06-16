const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/noticesController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const noticeValidation = [
  body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Title: 3-255 characters'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('target_role').optional().isIn(['all', 'student', 'faculty']),
  body('target_course_id').optional().isInt(),
];

router.use(authMiddleware);

router.get('/', ctrl.getNotices);
router.get('/faculty', authorize('admin', 'faculty'), ctrl.getFacultyNotices);
router.post('/', authorize('admin', 'faculty'), noticeValidation, ctrl.createNotice);
router.put('/:id',   authorize('admin', 'faculty'), ctrl.updateNotice);
router.delete('/:id', authorize('admin', 'faculty'), ctrl.deleteNotice);

module.exports = router;