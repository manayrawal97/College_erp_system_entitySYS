const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// All routes here require authentication and student role authorization
router.use(authMiddleware);
router.use(authorize('student'));

// Dashboard & Admission
router.get('/dashboard', ctrl.getDashboardStats);
router.get('/admission', ctrl.getAdmissionDetails);

// Exams
router.get('/exams/available', ctrl.getAvailableExams);
router.post('/exams/register', ctrl.registerExam);
router.get('/exams/hall-ticket/:id', ctrl.getHallTicket);

// Attendance
router.get('/attendance/student', ctrl.getAttendanceRecords);
router.get('/attendance/student/summary', ctrl.getAttendanceSummary);

// Grades
router.get('/grades/student', ctrl.getGrades);
router.get('/grades/student/summary', ctrl.getGradesSummary);

// LMS / Course Materials
router.get('/courses/materials', ctrl.getCourseMaterials);

module.exports = router;
