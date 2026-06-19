const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const markValidation = [
  body('course_id').isInt().withMessage('Valid course_id required'),
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('records').isArray({ min: 1 }).withMessage('records must be a non-empty array'),
  body('records.*.student_id').isInt().withMessage('Each record needs a valid student_id'),
  body('records.*.status').isIn(['present', 'absent', 'late']).withMessage('Status: present, absent, or late'),
];

router.use(authMiddleware);

router.post('/mark', authorize('admin', 'faculty'), markValidation, ctrl.markAttendance);
router.get('/student/:studentId', ctrl.getStudentAttendance);                    // students view own; faculty/admin view any
router.get('/course/:courseId/today', authorize('admin', 'faculty'), ctrl.getTodayAttendance);
router.get('/course/:courseId/date/:date', authorize('admin', 'faculty'), ctrl.getCourseAttendanceByDate);
router.get('/course/:courseId', authorize('admin', 'faculty'), ctrl.getCourseAttendance);
router.put('/:id', authorize('admin', 'faculty'), ctrl.updateAttendance);

module.exports = router;