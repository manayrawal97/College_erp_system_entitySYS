const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// POST /api/reports/attendance — Attendance report data
// ─────────────────────────────────────────────────────────────
exports.attendanceReport = async (req, res) => {
  try {
    const { course_id, student_id, from_date, to_date } = req.body;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (course_id)  { whereClause += ' AND a.course_id = ?';   params.push(course_id); }
    if (student_id) { whereClause += ' AND a.student_id = ?';  params.push(student_id); }
    if (from_date)  { whereClause += ' AND a.date >= ?';       params.push(from_date); }
    if (to_date)    { whereClause += ' AND a.date <= ?';       params.push(to_date); }

    // Faculty scope restriction
    if (req.user.role === 'faculty') {
      whereClause += ' AND EXISTS (SELECT 1 FROM course_assignments ca WHERE ca.course_id = a.course_id AND ca.faculty_id = ?)';
      params.push(req.user.id);
    }
    if (req.user.role === 'student') {
      whereClause += ' AND a.student_id = ?';
      params.push(req.user.id);
    }

    const [records] = await pool.query(
      `SELECT
         u.full_name AS student_name, sp.enrollment_id, sp.department,
         c.course_name, c.course_code,
         a.date, a.status, a.remarks,
         f.full_name AS marked_by
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN courses c ON a.course_id = c.id
       JOIN users f ON a.marked_by_faculty_id = f.id
       ${whereClause}
       ORDER BY u.full_name, a.date`,
      params
    );

    // Summary statistics
    const [summary] = await pool.query(
      `SELECT
         u.full_name, sp.enrollment_id,
         c.course_name, c.course_code,
         COUNT(*) AS total,
         SUM(a.status = 'present') AS present,
         SUM(a.status = 'absent')  AS absent,
         SUM(a.status = 'late')    AS late,
         ROUND(SUM(a.status IN ('present','late')) / COUNT(*) * 100, 2) AS percentage
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN courses c ON a.course_id = c.id
       ${whereClause}
       GROUP BY u.id, c.id
       ORDER BY u.full_name`,
      params
    );

    res.json({
      success: true,
      data: { records, summary },
      meta: { generated_at: new Date(), filters: { course_id, student_id, from_date, to_date } },
    });
  } catch (err) {
    console.error('attendanceReport error:', err);
    res.status(500).json({ success: false, message: 'Server error generating report' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/reports/grades — Grades report data
// ─────────────────────────────────────────────────────────────
exports.gradesReport = async (req, res) => {
  try {
    const { course_id, student_id, exam_type, semester } = req.body;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (course_id)  { whereClause += ' AND e.course_id = ?';  params.push(course_id); }
    if (student_id) { whereClause += ' AND g.student_id = ?'; params.push(student_id); }
    if (exam_type)  { whereClause += ' AND e.exam_type = ?';  params.push(exam_type); }
    if (semester)   { whereClause += ' AND c.semester = ?';   params.push(semester); }

    if (req.user.role === 'faculty') {
      whereClause += ' AND EXISTS (SELECT 1 FROM course_assignments ca WHERE ca.course_id = e.course_id AND ca.faculty_id = ?)';
      params.push(req.user.id);
    }
    if (req.user.role === 'student') {
      whereClause += ' AND g.student_id = ?';
      params.push(req.user.id);
    }

    const [records] = await pool.query(
      `SELECT
         u.full_name AS student_name, sp.enrollment_id,
         c.course_name, c.course_code, c.credits,
         e.exam_name, e.exam_type, e.exam_date, e.total_marks,
         g.marks_obtained, g.grade, g.entered_at
       FROM grades g
       JOIN users u ON g.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN exams e ON g.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       ${whereClause}
       ORDER BY u.full_name, c.course_code`,
      params
    );

    // CGPA per student
    const [cgpaRows] = await pool.query(
      `SELECT
         u.id AS student_id, u.full_name, sp.enrollment_id,
         ROUND(
           SUM(c.credits * CASE
             WHEN (g.marks_obtained / e.total_marks) >= 0.90 THEN 10
             WHEN (g.marks_obtained / e.total_marks) >= 0.80 THEN 9
             WHEN (g.marks_obtained / e.total_marks) >= 0.70 THEN 8
             WHEN (g.marks_obtained / e.total_marks) >= 0.60 THEN 7
             WHEN (g.marks_obtained / e.total_marks) >= 0.50 THEN 6
             WHEN (g.marks_obtained / e.total_marks) >= 0.40 THEN 5
             WHEN (g.marks_obtained / e.total_marks) >= 0.33 THEN 4
             ELSE 0
           END) / SUM(c.credits), 2
         ) AS cgpa
       FROM grades g
       JOIN users u ON g.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN exams e ON g.exam_id = e.id AND e.exam_type = 'final'
       JOIN courses c ON e.course_id = c.id
       ${whereClause}
       GROUP BY u.id`,
      params
    );

    res.json({
      success: true,
      data: { records, cgpa_summary: cgpaRows },
      meta: { generated_at: new Date(), filters: { course_id, student_id, exam_type, semester } },
    });
  } catch (err) {
    console.error('gradesReport error:', err);
    res.status(500).json({ success: false, message: 'Server error generating grades report' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/reports/fees — Financial report (Admin only)
// ─────────────────────────────────────────────────────────────
exports.feesReport = async (req, res) => {
  try {
    const { from_date, to_date, fee_type, status } = req.body;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (from_date) { whereClause += ' AND ft.payment_date >= ?'; params.push(from_date); }
    if (to_date)   { whereClause += ' AND ft.payment_date <= ?'; params.push(to_date); }
    if (fee_type)  { whereClause += ' AND ft.fee_type = ?';      params.push(fee_type); }
    if (status)    { whereClause += ' AND ft.status = ?';        params.push(status); }

    const [records] = await pool.query(
      `SELECT ft.*,
              u.full_name AS student_name, sp.enrollment_id, sp.department,
              e.exam_name, c.course_name
       FROM fee_transactions ft
       JOIN users u ON ft.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN exams e ON ft.exam_id = e.id
       LEFT JOIN courses c ON e.course_id = c.id
       ${whereClause}
       ORDER BY ft.payment_date DESC`,
      params
    );

    const [totals] = await pool.query(
      `SELECT
         SUM(CASE WHEN status = 'paid'    THEN amount ELSE 0 END) AS collected,
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending,
         COUNT(CASE WHEN status = 'paid'  THEN 1 END) AS paid_count,
         COUNT(*) AS total_transactions
       FROM fee_transactions ft ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: { records, totals: totals[0] },
      meta: { generated_at: new Date(), filters: { from_date, to_date, fee_type, status } },
    });
  } catch (err) {
    console.error('feesReport error:', err);
    res.status(500).json({ success: false, message: 'Server error generating fees report' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/admit-card/generate — Student generates admit card data
// ─────────────────────────────────────────────────────────────
exports.generateAdmitCard = async (req, res) => {
  try {
    const { exam_id } = req.body;
    const student_id = req.user.role === 'student' ? req.user.id : req.body.student_id;

    if (!exam_id) return res.status(400).json({ success: false, message: 'exam_id is required' });
    if (!student_id) return res.status(400).json({ success: false, message: 'student_id is required' });

    // Verify fee is paid for this exam
    const [feePaid] = await pool.query(
      "SELECT id, receipt_no FROM fee_transactions WHERE student_id = ? AND exam_id = ? AND status = 'paid'",
      [student_id, exam_id]
    );
    if (!feePaid.length) {
      return res.status(402).json({ success: false, message: 'Exam fee not paid. Pay $12 to generate admit card.' });
    }

    // Verify enrollment
    const [enrolled] = await pool.query(
      `SELECT en.* FROM enrollments en
       JOIN exams e ON en.course_id = e.course_id
       WHERE e.id = ? AND en.student_id = ? AND en.status = 'active'`,
      [exam_id, student_id]
    );
    if (!enrolled.length) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this exam\'s course' });
    }

    // Fetch all data needed for the admit card
    const [rows] = await pool.query(
      `SELECT
         u.full_name, u.email, u.phone,
         sp.enrollment_id, sp.department, sp.current_semester,
         e.exam_name, e.exam_date, e.total_marks, e.exam_type,
         c.course_name, c.course_code, c.credits,
         fu.full_name AS faculty_name
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN enrollments en ON u.id = en.student_id
       JOIN exams e ON en.course_id = e.course_id AND e.id = ?
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN course_assignments ca ON c.id = ca.course_id
       LEFT JOIN users fu ON ca.faculty_id = fu.id
       WHERE u.id = ?`,
      [exam_id, student_id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Admit card data not found' });

    const admitCard = {
      admit_card_no: `ADM-${exam_id}-${student_id}-${Date.now()}`,
      student: {
        name: rows[0].full_name,
        email: rows[0].email,
        phone: rows[0].phone,
        enrollment_id: rows[0].enrollment_id,
        department: rows[0].department,
        semester: rows[0].current_semester,
      },
      exam: {
        name: rows[0].exam_name,
        date: rows[0].exam_date,
        type: rows[0].exam_type,
        total_marks: rows[0].total_marks,
        duration: '3 Hours',
        reporting_time: '09:00 AM',
      },
      course: {
        name: rows[0].course_name,
        code: rows[0].course_code,
        credits: rows[0].credits,
        faculty: rows[0].faculty_name,
      },
      payment: {
        receipt_no: feePaid[0].receipt_no,
        amount_paid: 12.00,
      },
      instructions: [
        'Bring this admit card to the examination hall',
        'Arrive 30 minutes before exam start time',
        'No mobile phones or electronic devices allowed',
        'Bring college ID card along with admit card',
        'Report to your allocated examination room',
      ],
      issued_at: new Date(),
      institution: 'EntitySYS University',
    };

    res.json({ success: true, data: admitCard });
  } catch (err) {
    console.error('generateAdmitCard error:', err);
    res.status(500).json({ success: false, message: 'Server error generating admit card' });
  }
};