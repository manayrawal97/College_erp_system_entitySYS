const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// All dashboard stats are admin-only
router.get('/stats', authMiddleware, authorize('admin', 'faculty'), ctrl.getStats);

module.exports = router;
