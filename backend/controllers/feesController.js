const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// Generate a unique receipt number: RCP-YYYYMMDD-XXXXXXXX
const generateReceiptNo = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `RCP-${date}-${random}`;
};

// ─────────────────────────────────────────────────────────────
// POST /api/fees/pay — Student pays/registers for an exam ($12)
// ─────────────────────────────────────────────────────────────
exports.payFee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { fee_type, exam_id, amount } = req.body;
  const student_id = req.user.id; // Students can only pay for themselves

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // If paying exam fee, verify student is enrolled in the course
    if (fee_type === 'exam' && exam_id) {
      const [exam] = await connection.query(
        `SELECT e.id FROM exams e
         JOIN enrollments en ON e.course_id = en.course_id
         WHERE e.id = ? AND en.student_id = ? AND en.status = 'active'`,
        [exam_id, student_id]
      );
      if (!exam.length) {
        await connection.rollback();
        return res.status(403).json({ success: false, message: 'Not enrolled in this exam\'s course' });
      }

      // Prevent duplicate exam fee payment
      const [existing] = await connection.query(
        "SELECT id FROM fee_transactions WHERE student_id = ? AND exam_id = ? AND status = 'paid'",
        [student_id, exam_id]
      );
      if (existing.length) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'Exam fee already paid' });
      }
    }

    const EXAM_FEE = 12.00;
    const finalAmount = fee_type === 'exam' ? EXAM_FEE : (amount || EXAM_FEE);
    const receipt_no = generateReceiptNo();

    // Simulate payment processing (in production: integrate payment gateway)
    const [result] = await connection.query(
      `INSERT INTO fee_transactions (student_id, amount, fee_type, status, receipt_no, exam_id)
       VALUES (?, ?, ?, 'paid', ?, ?)`,
      [student_id, finalAmount, fee_type, receipt_no, exam_id || null]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Payment successful',
      data: {
        transaction_id: result.insertId,
        receipt_no,
        amount: finalAmount,
        status: 'paid',
        payment_date: new Date(),
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error('payFee error:', err);
    res.status(500).json({ success: false, message: 'Server error processing payment' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/fees/student/:studentId — Student views own payment history
// ─────────────────────────────────────────────────────────────
exports.getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own fees
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [transactions] = await pool.query(
      `SELECT ft.*,
              e.exam_name, e.exam_date,
              c.course_name, c.course_code
       FROM fee_transactions ft
       LEFT JOIN exams e ON ft.exam_id = e.id
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE ft.student_id = ?
       ORDER BY ft.payment_date DESC`,
      [studentId]
    );

    const [summary] = await pool.query(
      `SELECT
         SUM(CASE WHEN status = 'paid'    THEN amount ELSE 0 END) AS total_paid,
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS total_pending,
         COUNT(CASE WHEN status = 'paid'    THEN 1 END) AS paid_count,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
       FROM fee_transactions
       WHERE student_id = ?`,
      [studentId]
    );

    res.json({ success: true, data: { transactions, summary: summary[0] } });
  } catch (err) {
    console.error('getStudentFees error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/fees/transactions — Admin views all transactions
// ─────────────────────────────────────────────────────────────
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, fee_type, from_date, to_date, student_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status)     { whereClause += ' AND ft.status = ?';      params.push(status); }
    if (fee_type)   { whereClause += ' AND ft.fee_type = ?';    params.push(fee_type); }
    if (student_id) { whereClause += ' AND ft.student_id = ?';  params.push(student_id); }
    if (from_date)  { whereClause += ' AND ft.payment_date >= ?'; params.push(from_date); }
    if (to_date)    { whereClause += ' AND ft.payment_date <= ?'; params.push(to_date); }

    const [transactions] = await pool.query(
      `SELECT ft.*, u.full_name AS student_name, sp.enrollment_id,
              e.exam_name, c.course_name
       FROM fee_transactions ft
       JOIN users u ON ft.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN exams e ON ft.exam_id = e.id
       LEFT JOIN courses c ON e.course_id = c.id
       ${whereClause}
       ORDER BY ft.payment_date DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [totals] = await pool.query(
      `SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS total_collected,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) AS total_transactions
       FROM fee_transactions ft ${whereClause}`,
      params
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM fee_transactions ft ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: transactions,
      totals: totals[0],
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getAllTransactions error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/fees/generate-receipt — Get receipt data for a transaction
// ─────────────────────────────────────────────────────────────
exports.generateReceipt = async (req, res) => {
  try {
    const { transaction_id } = req.body;
    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'transaction_id is required' });
    }

    const [rows] = await pool.query(
      `SELECT ft.*,
              u.full_name AS student_name, u.email AS student_email, u.phone AS student_phone,
              sp.enrollment_id, sp.department, sp.current_semester,
              e.exam_name, e.exam_date,
              c.course_name, c.course_code
       FROM fee_transactions ft
       JOIN users u ON ft.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN exams e ON ft.exam_id = e.id
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE ft.id = ?`,
      [transaction_id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found' });

    // Students can only get their own receipt
    if (req.user.role === 'student' && rows[0].student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Return structured receipt data (frontend uses this to generate PDF)
    res.json({
      success: true,
      data: {
        receipt_no: rows[0].receipt_no,
        student: {
          name: rows[0].student_name,
          email: rows[0].student_email,
          phone: rows[0].student_phone,
          enrollment_id: rows[0].enrollment_id,
          department: rows[0].department,
          semester: rows[0].current_semester,
        },
        payment: {
          amount: rows[0].amount,
          fee_type: rows[0].fee_type,
          status: rows[0].status,
          payment_date: rows[0].payment_date,
        },
        exam: rows[0].exam_name ? {
          name: rows[0].exam_name,
          date: rows[0].exam_date,
          course_name: rows[0].course_name,
          course_code: rows[0].course_code,
        } : null,
        issued_at: new Date(),
        institution: 'EntitySYS University',
      },
    });
  } catch (err) {
    console.error('generateReceipt error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/fees/transactions/:id — Admin manually marks payment
// ─────────────────────────────────────────────────────────────
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [rows] = await pool.query('SELECT id FROM fee_transactions WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Transaction not found' });

    await pool.query('UPDATE fee_transactions SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Transaction status updated' });
  } catch (err) {
    console.error('updateTransactionStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};