const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportsController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/attendance', authorize('admin', 'faculty', 'student'), ctrl.attendanceReport);
router.post('/grades', authorize('admin', 'faculty', 'student'), ctrl.gradesReport);
router.post('/fees', authorize('admin'), ctrl.feesReport);
router.post('/admit-card/generate', ctrl.generateAdmitCard);

module.exports = router;