const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware: authenticate } = require('../middleware/authMiddleware');

// Validation rules (reusable)
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be 8+ chars with uppercase, lowercase & number'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  body('full_name').trim().isLength({ min: 2 }).withMessage('Full name required'),
  body('department')
    .if(body('role').isIn(['student', 'faculty']))
    .isIn(['CSE','EE','EC','Mechanical','Civil'])
    .withMessage('Valid department required for students/faculty'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

const changePasswordValidation = [
  body('current_password').notEmpty().withMessage('Current password required'),
  body('new_password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must be 8+ chars with uppercase, lowercase & number'),
];

router.post('/register',        registerValidation,       authController.register);
router.post('/login',           loginValidation,          authController.login);
router.get ('/me',              authenticate,             authController.getMe);
router.post('/change-password', authenticate, changePasswordValidation, authController.changePassword);

module.exports = router;