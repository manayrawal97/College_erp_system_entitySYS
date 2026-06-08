const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// POST /api/attendance/mark — Faculty marks attendance for a course+date
// ─────────────────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { course_id, date, records } = req.body;
  // records = [{ student_id, status, remarks }, ...]

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify faculty is actually assigned to this course
    const [assignment] = await connection.query(
      'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
      [req.user.id, course_id]
    );
    if (!assignment.length) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'You are not assigned to this course' });
    }

    // Validate all student_ids are enrolled in this course
    const studentIds = records.map(r => r.student_id);
    const [enrolled] = await connection.query(
      `SELECT student_id FROM enrollments
       WHERE course_id = ? AND student_id IN (?) AND status = 'active'`,
      [course_id, studentIds]
    );
    const enrolledIds = new Set(enrolled.map(e => e.student_id));
    const invalid = studentIds.filter(id => !enrolledIds.has(id));
    if (invalid.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `These student IDs are not enrolled: ${invalid.join(', ')}`,
      });
    }

    // Bulk upsert — marks or updates attendance for the given date
    const values = records.map(r => [r.student_id, course_id, date, r.status, req.user.id, r.remarks || null]);
    await connection.query(
      `INSERT INTO attendance (student_id, course_id, date, status, marked_by_faculty_id, remarks)
       VALUES ?
       ON DUPLICATE KEY UPDATE
         status = VALUES(status),
         marked_by_faculty_id = VALUES(marked_by_faculty_id),
         remarks = VALUES(remarks)`,
      [values]
    );

    await connection.commit();
    res.json({ success: true, message: `Attendance marked for ${records.length} students on ${date}` });
  } catch (err) {
    await connection.rollback();
    console.error('markAttendance error:', err);
    res.status(500).json({ success: false, message: 'Server error marking attendance' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/attendance/student/:studentId — Student views own attendance
// ─────────────────────────────────────────────────────────────
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { course_id, from_date, to_date } = req.query;

    // Students can only view their own attendance
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let whereClause = 'WHERE a.student_id = ?';
    const params = [studentId];

    if (course_id) { whereClause += ' AND a.course_id = ?'; params.push(course_id); }
    if (from_date) { whereClause += ' AND a.date >= ?';    params.push(from_date); }
    if (to_date)   { whereClause += ' AND a.date <= ?';    params.push(to_date); }

    const [records] = await pool.query(
      `SELECT a.*, c.course_name, c.course_code,
              u.full_name AS marked_by_name
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       JOIN users u ON a.marked_by_faculty_id = u.id
       ${whereClause}
       ORDER BY a.date DESC`,
      params
    );

    // Calculate per-course attendance percentage
    const [summary] = await pool.query(
      `SELECT
         c.id AS course_id, c.course_name, c.course_code,
         COUNT(*) AS total_classes,
         SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END) AS late_count,
         SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) AS absent_count,
         ROUND(
           (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / COUNT(*)) * 100,
           2
         ) AS attendance_percentage
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE a.student_id = ?
       GROUP BY c.id, c.course_name, c.course_code`,
      [studentId]
    );

    res.json({ success: true, data: { records, summary } });
  } catch (err) {
    console.error('getStudentAttendance error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/attendance/course/:courseId — Faculty views course attendance
// ─────────────────────────────────────────────────────────────
exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, from_date, to_date, student_id } = req.query;

    // Faculty must be assigned to this course
    if (req.user.role === 'faculty') {
      const [assignment] = await pool.query(
        'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
        [req.user.id, courseId]
      );
      if (!assignment.length) return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let whereClause = 'WHERE a.course_id = ?';
    const params = [courseId];

    if (date)       { whereClause += ' AND a.date = ?';       params.push(date); }
    if (from_date)  { whereClause += ' AND a.date >= ?';      params.push(from_date); }
    if (to_date)    { whereClause += ' AND a.date <= ?';      params.push(to_date); }
    if (student_id) { whereClause += ' AND a.student_id = ?'; params.push(student_id); }

    const [records] = await pool.query(
      `SELECT a.*,
              u.full_name AS student_name, sp.enrollment_id,
              f.full_name AS marked_by_name
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN users f ON a.marked_by_faculty_id = f.id
       ${whereClause}
       ORDER BY a.date DESC, u.full_name`,
      params
    );

    // Attendance summary per student for this course
    const [studentSummary] = await pool.query(
      `SELECT
         u.id AS student_id, u.full_name, sp.enrollment_id,
         COUNT(*) AS total,
         SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present,
         SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END) AS late,
         SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) AS absent,
         ROUND(
           (SUM(CASE WHEN a.status IN ('present','late') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2
         ) AS percentage
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE a.course_id = ?
       GROUP BY u.id, u.full_name, sp.enrollment_id
       ORDER BY u.full_name`,
      [courseId]
    );

    res.json({ success: true, data: { records, student_summary: studentSummary } });
  } catch (err) {
    console.error('getCourseAttendance error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/attendance/:id — Faculty edits a single attendance record
// ─────────────────────────────────────────────────────────────
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be: present, absent, or late' });
    }

    const [rows] = await pool.query(
      'SELECT a.*, ca.faculty_id FROM attendance a JOIN course_assignments ca ON a.course_id = ca.course_id WHERE a.id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Attendance record not found' });

    // Faculty can only edit their own course's attendance
    if (req.user.role === 'faculty' && rows[0].faculty_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await pool.query(
      'UPDATE attendance SET status = ?, remarks = ?, marked_by_faculty_id = ? WHERE id = ?',
      [status, remarks || null, req.user.id, id]
    );

    res.json({ success: true, message: 'Attendance record updated' });
  } catch (err) {
    console.error('updateAttendance error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};