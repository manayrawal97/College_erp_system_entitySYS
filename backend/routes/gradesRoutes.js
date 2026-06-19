const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/gradesController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const examValidation = [
  body('course_id').isInt(),
  body('exam_name').trim().isLength({ min: 3 }),
  body('exam_date').isDate(),
  body('total_marks').isInt({ min: 1 }),
  body('exam_type').isIn(['midterm', 'final', 'quiz', 'assignment']),
];

const gradesValidation = [
  body('exam_id').isInt().withMessage('Valid exam_id required'),
  body('grades').isArray({ min: 1 }),
  body('grades.*.student_id').isInt(),
  body('grades.*.marks_obtained').isFloat({ min: 0 }),
];

router.use(authMiddleware);

// Exams
router.post('/exams', authorize('admin', 'faculty'), examValidation, ctrl.createExam);
router.get('/exams', ctrl.getExams);
router.get('/exams/:examId/grades', authorize('admin', 'faculty'), ctrl.getExamGrades);

// Grades
router.post('/enter', authorize('admin', 'faculty'), gradesValidation, ctrl.enterGrades);
router.post('/bulk', authorize('admin', 'faculty'), gradesValidation, ctrl.enterGrades);
router.get('/student/:studentId', ctrl.getStudentGrades);
router.get('/course/:courseId', authorize('admin', 'faculty'), ctrl.getCourseGrades);
router.put('/:id', authorize('admin', 'faculty'), ctrl.updateGrade);

module.exports = router;