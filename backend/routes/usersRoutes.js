const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/usersController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const userCreateValidation = [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase and a number'),
    body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('department')
        .if(body('role').isIn(['student', 'faculty']))
        .isIn(['CSE', 'EE', 'EC', 'Mechanical', 'Civil']).withMessage('Invalid department selected'),
];

const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', ctrl.getProfile);
router.get('/export', authorize('admin'), ctrl.exportUsers);
router.post('/import', authorize('admin'), upload.single('file'), ctrl.importUsers);
router.get('/', authorize('admin', 'faculty'), ctrl.getUsers);
router.get('/:id', ctrl.getUserById);

// role check is inside controller
router.post('/', authorize('admin'), userCreateValidation, ctrl.createUser);
router.put('/:id', ctrl.updateUser);

// role check is inside controller
router.delete('/:id', authorize('admin'), ctrl.deleteUser);
router.get('/:id/students', authorize('admin', 'faculty'), ctrl.getFacultyStudents);


module.exports = router;