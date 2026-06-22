const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/coursesController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const courseValidation = [
    body('course_code').trim().notEmpty().withMessage('Course code required'),
    body('course_name').trim().isLength({ min: 3 }).withMessage('Course name required'),
    body('department').isIn(['CSE', 'EE', 'EC', 'Mechanical', 'Civil']),
    body('semester').isInt({ min: 1, max: 8 }),
];

const assignFacultyValidation = [
    body('faculty_id').isInt().withMessage('Valid faculty_id required'),
    body('academic_year').optional().matches(/^\d{4}-\d{4}$/),
];

router.use(authMiddleware);

// Faculty: see their own assigned courses
router.get('/faculty', authorize('admin', 'faculty'), ctrl.getFacultyCourses);
router.get('/faculty/assigned', authorize('admin', 'faculty'), ctrl.getFacultyCourses);
router.get('/faculty/:id/courses', authorize('admin', 'faculty'), ctrl.getFacultyCourses);

// Admin: CRUD operations on courses
router.post('/', authorize('admin'), courseValidation, ctrl.createCourse);
router.put('/:id', authorize('admin'), ctrl.updateCourse);
router.delete('/:id', authorize('admin'), ctrl.deleteCourse);
router.post('/:id/enroll', authorize('admin'), ctrl.enrollStudent);
router.post('/:id/assign-faculty', authorize('admin'), assignFacultyValidation, ctrl.assignFaculty);

router.get('/', ctrl.getCourses);
router.get('/:id', ctrl.getCourseById);
router.get('/:id/students', authorize('admin', 'faculty'), ctrl.getCourseStudents);

module.exports = router;