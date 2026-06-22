const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/feesController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const payValidation = [
  body('fee_type').isIn(['exam', 'tuition', 'library', 'other']),
  body('exam_id').optional().isInt(),
  body('amount').optional().isFloat({ min: 0.01 }),
];

router.use(authMiddleware);

router.post('/pay', authorize('student'), payValidation, ctrl.payFee);
router.get('/student/:studentId', ctrl.getStudentFees);
router.get('/transactions', authorize('admin'), ctrl.getAllTransactions);
router.post('/transactions', authorize('admin'), ctrl.createTransaction);
router.delete('/transactions/:id', authorize('admin'), ctrl.deleteTransaction);
router.post('/generate-receipt', ctrl.generateReceipt);
router.put('/transactions/:id', authorize('admin'), ctrl.updateTransactionStatus);

module.exports = router;