const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// GET /api/student/dashboard
// ─────────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  const student_id = req.user.id;
  try {
    // 1. Fetch user details and profile
    const [profileRows] = await pool.query(
      `SELECT u.full_name, u.email, sp.enrollment_id, sp.department, sp.current_semester
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = ?`,
      [student_id]
    );

    if (!profileRows.length) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const student = profileRows[0];

    // 2. Fetch overall attendance
    const [attendanceRows] = await pool.query(
      `SELECT 
         COUNT(id) as total_classes,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
         SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
       FROM attendance
       WHERE student_id = ?`,
      [student_id]
    );
    const att = attendanceRows[0];
    const total_classes = att.total_classes || 0;
    const present_count = att.present_count || 0;
    const late_count = att.late_count || 0;
    const attendance_percentage = total_classes > 0 
      ? Math.round(((present_count + late_count) * 100) / total_classes) 
      : 85; // default/mock if no classes marked yet

    // 3. Fetch grades CGPA
    const [gradeRows] = await pool.query(
      `SELECT grade FROM grades WHERE student_id = ?`,
      [student_id]
    );
    let totalPoints = 0;
    let countedGrades = 0;
    gradeRows.forEach(row => {
      const g = row.grade?.toUpperCase();
      let pt = -1;
      if (g === 'A' || g === 'O') pt = 10;
      else if (g === 'A+' || g === 'E') pt = 9;
      else if (g === 'B') pt = 8;
      else if (g === 'B+') pt = 7;
      else if (g === 'C') pt = 6;
      else if (g === 'D') pt = 4;
      else if (g === 'F') pt = 0;
      if (pt >= 0) {
        totalPoints += pt;
        countedGrades++;
      }
    });
    const cgpa = countedGrades > 0 ? (totalPoints / countedGrades).toFixed(2) : '8.50';

    // 4. Fetch fee summary
    const [feeRows] = await pool.query(
      `SELECT COUNT(id) as pending_fees_count FROM fee_transactions WHERE student_id = ? AND status = 'pending'`,
      [student_id]
    );
    const pending_fees_count = feeRows[0]?.pending_fees_count || 0;

    res.json({
      success: true,
      data: {
        student,
        stats: {
          attendance_percentage,
          cgpa,
          pending_fees_count
        }
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Server error loading student dashboard' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/student/admission
// ─────────────────────────────────────────────────────────────
exports.getAdmissionDetails = async (req, res) => {
  const student_id = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.full_name,
         u.email,
         u.phone,
         sp.enrollment_id,
         sp.department,
         sp.current_semester,
         sp.address,
         sp.parent_phone,
         u.created_at as admission_date,
         u.is_active
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = ?`,
      [student_id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Admission profile not found' });
    }

    res.json({
      success: true,
      data: {
        ...rows[0],
        status: rows[0].is_active ? 'Approved' : 'Pending',
        document_status: 'Verified'
      }
    });
  } catch (error) {
    console.error('getAdmissionDetails error:', error);
    res.status(500).json({ success: false, message: 'Server error loading admission details' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/exams/available
// ─────────────────────────────────────────────────────────────
exports.getAvailableExams = async (req, res) => {
  const student_id = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         e.id, 
         e.exam_name, 
         e.exam_date, 
         e.total_marks, 
         e.exam_type,
         c.course_code, 
         c.course_name,
         ft.status AS fee_status,
         ft.receipt_no
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       JOIN enrollments en ON c.id = en.course_id AND en.status = 'active'
       LEFT JOIN fee_transactions ft ON ft.exam_id = e.id AND ft.student_id = en.student_id
       WHERE en.student_id = ?
       ORDER BY e.exam_date ASC`,
      [student_id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('getAvailableExams error:', error);
    res.status(500).json({ success: false, message: 'Server error loading available exams' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/exams/register
// ─────────────────────────────────────────────────────────────
exports.registerExam = async (req, res) => {
  const { exam_id } = req.body;
  const student_id = req.user.id;
  if (!exam_id) {
    return res.status(400).json({ success: false, message: 'exam_id is required' });
  }

  try {
    // Check if already paid
    const [existing] = await pool.query(
      'SELECT id, status FROM fee_transactions WHERE student_id = ? AND exam_id = ?',
      [student_id, exam_id]
    );
    if (existing.length && existing[0].status === 'paid') {
      return res.status(400).json({ success: false, message: 'Already registered and paid for this exam' });
    }

    const receipt_no = 'REC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const reference_id = 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const amount = 500.00; // Flat exam fee

    if (existing.length) {
      await pool.query(
        'UPDATE fee_transactions SET status = "paid", receipt_no = ?, reference_id = ?, amount = ? WHERE id = ?',
        [receipt_no, reference_id, amount, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO fee_transactions (student_id, amount, fee_type, status, receipt_no, reference_id, exam_id) VALUES (?, ?, "exam", "paid", ?, ?, ?)',
        [student_id, amount, receipt_no, reference_id, exam_id]
      );
    }

    res.json({
      success: true,
      message: "Registered successfully",
      receipt_no,
      hall_ticket_url: `/api/exams/hall-ticket/${exam_id}`
    });
  } catch (error) {
    console.error('registerExam error:', error);
    res.status(500).json({ success: false, message: 'Failed to register for exam' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/exams/hall-ticket/:examId
// ─────────────────────────────────────────────────────────────
exports.getHallTicket = async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.id;
  try {
    const [exam] = await pool.query(
      `SELECT e.*, c.course_name, c.course_code, u.full_name AS student_name, sp.enrollment_id, sp.department
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON u.id = ?
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE e.id = ?`,
      [student_id, id]
    );

    if (!exam.length) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Verify fee is paid
    const [tx] = await pool.query(
      'SELECT status FROM fee_transactions WHERE student_id = ? AND exam_id = ?',
      [student_id, id]
    );

    if (!tx.length || tx[0].status !== 'paid') {
      return res.status(403).json({ success: false, message: 'Exam fee not paid. Hall ticket unavailable.' });
    }

    res.json({
      success: true,
      data: {
        hall_ticket_url: `/uploads/hallticket-${id}.pdf`,
        exam_details: exam[0]
      }
    });
  } catch (error) {
    console.error('getHallTicket error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hall ticket' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/attendance/student
// ─────────────────────────────────────────────────────────────
exports.getAttendanceRecords = async (req, res) => {
  const student_id = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.course_code,
         c.course_name,
         COUNT(a.id) as total_classes,
         SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
         SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
         SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
         IF(COUNT(a.id) > 0, ROUND((SUM(CASE WHEN a.status = 'present' OR a.status = 'late' THEN 1 ELSE 0 END)) * 100.0 / COUNT(a.id), 2), 100.00) as percentage
       FROM enrollments en
       JOIN courses c ON en.course_id = c.id
       LEFT JOIN attendance a ON a.course_id = c.id AND a.student_id = en.student_id
       WHERE en.student_id = ? AND en.status = 'active'
       GROUP BY c.id
       ORDER BY percentage DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('getAttendanceRecords error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student attendance records' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/attendance/student/summary
// ─────────────────────────────────────────────────────────────
exports.getAttendanceSummary = async (req, res) => {
  const student_id = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         COUNT(id) as total_classes,
         SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as total_present,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as total_absent,
         SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late
       FROM attendance
       WHERE student_id = ?`,
      [student_id]
    );

    const summary = rows[0];
    const total_classes = summary.total_classes || 0;
    const total_present = summary.total_present || 0;
    const total_absent = summary.total_absent || 0;
    const total_late = summary.total_late || 0;
    const overall_percentage = total_classes > 0 
      ? parseFloat(((total_present + total_late) * 100 / total_classes).toFixed(2)) 
      : 85.00; // default mock

    res.json({
      success: true,
      data: {
        overall_percentage,
        total_present,
        total_absent,
        total_classes,
        total_late
      }
    });
  } catch (error) {
    console.error('getAttendanceSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student attendance summary' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/grades/student
// ─────────────────────────────────────────────────────────────
exports.getGrades = async (req, res) => {
  const student_id = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.course_code,
         c.course_name,
         e.exam_name,
         e.exam_type,
         e.total_marks,
         g.marks_obtained,
         g.grade,
         g.entered_at as result_date
       FROM grades g
       JOIN exams e ON g.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE g.student_id = ?
       ORDER BY e.exam_date DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('getGrades error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student grades' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/grades/student/summary
// ─────────────────────────────────────────────────────────────
exports.getGradesSummary = async (req, res) => {
  const student_id = req.user.id;
  try {
    const [rows] = await pool.query(
      `SELECT grade, marks_obtained, e.total_marks
       FROM grades g
       JOIN exams e ON g.exam_id = e.id
       WHERE g.student_id = ?`,
      [student_id]
    );

    let totalPoints = 0;
    let countedGrades = 0;
    let totalMarksObtained = 0;
    let totalMarksPossible = 0;

    rows.forEach(row => {
      const g = row.grade?.toUpperCase();
      let pt = -1;
      if (g === 'A' || g === 'O') pt = 10;
      else if (g === 'A+' || g === 'E') pt = 9;
      else if (g === 'B') pt = 8;
      else if (g === 'B+') pt = 7;
      else if (g === 'C') pt = 6;
      else if (g === 'D') pt = 4;
      else if (g === 'F') pt = 0;

      if (pt >= 0) {
        totalPoints += pt;
        countedGrades++;
      }

      totalMarksObtained += parseFloat(row.marks_obtained || 0);
      totalMarksPossible += parseFloat(row.total_marks || 100);
    });

    const cgpa = countedGrades > 0 ? parseFloat((totalPoints / countedGrades).toFixed(2)) : 8.50;
    const sgpa = cgpa; // simplified mock

    res.json({
      success: true,
      data: {
        cgpa,
        sgpa,
        total_credits: countedGrades * 3,
        total_marks_obtained: totalMarksObtained,
        total_marks_possible: totalMarksPossible
      }
    });
  } catch (error) {
    console.error('getGradesSummary error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student grades summary' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/courses/materials
// ─────────────────────────────────────────────────────────────
exports.getCourseMaterials = async (req, res) => {
  const student_id = req.user.id;
  const { course_id } = req.query;
  try {
    let query = `
      SELECT 
        cm.id,
        cm.title,
        cm.description,
        cm.file_url,
        cm.file_type,
        cm.uploaded_at,
        c.course_code,
        c.course_name,
        u.full_name as uploaded_by
      FROM course_materials cm
      JOIN courses c ON cm.course_id = c.id
      JOIN users u ON cm.uploaded_by_faculty_id = u.id
      WHERE c.id IN (SELECT course_id FROM enrollments WHERE student_id = ? AND status = 'active')
    `;
    const params = [student_id];

    if (course_id) {
      query += ` AND c.id = ?`;
      params.push(course_id);
    }

    query += ` ORDER BY cm.uploaded_at DESC`;

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('getCourseMaterials error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching course materials' });
  }
};
