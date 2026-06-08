const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/usersController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const userCreateValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('role').isIn(['student', 'faculty', 'admin']),
    body('full_name').trim().isLength({ min: 2 }),
    body('department')
        .if(body('role').isIn(['student', 'faculty']))
        .isIn(['CSE', 'EE', 'EC', 'Mechanical', 'Civil']),
];

// All routes require authentication
router.use(authMiddleware);

router.get('/', authorize('admin', 'faculty'), ctrl.getUsers);
router.get('/:id', ctrl.getUserById);

// role check is inside controller
router.post('/', authorize('admin'), userCreateValidation, ctrl.createUser);
router.put('/:id', ctrl.updateUser);

// role check is inside controller
router.delete('/:id', authorize('admin'), ctrl.deleteUser);
router.get('/:id/students', authorize('admin', 'faculty'), ctrl.getFacultyStudents);


module.exports = router;