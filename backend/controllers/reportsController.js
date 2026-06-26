const pool = require('../config/db.config');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ─────────────────────────────────────────────────────────────
// PDF & Excel Helper Functions
// ─────────────────────────────────────────────────────────────
function generatePDFReport(title, headers, rows, subtitle = '') {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Header Title
  doc.fontSize(20).fillColor('#1e3a8a').text(title, { align: 'center' });
  if (subtitle) {
    doc.fontSize(10).fillColor('#4b5563').text(subtitle, { align: 'center' });
  }
  doc.moveDown(2);

  const startX = 40;
  let startY = doc.y;
  const colWidth = 515 / headers.length; // A4 width is 595. Printable width: 595 - 2*40 = 515

  // Draw Header Row
  doc.fontSize(9).fillColor('#ffffff').rect(startX, startY, 515, 20).fill('#1e3a8a');
  doc.fillColor('#ffffff');
  headers.forEach((h, i) => {
    doc.text(h, startX + i * colWidth + 5, startY + 5, { width: colWidth - 10, height: 12, ellipsis: true });
  });

  startY += 20;
  doc.fillColor('#374151');

  // Draw Row Data
  rows.forEach((row, rowIndex) => {
    if (startY > 740) { // Keep a safe margin at page bottom (A4 height is 842)
      doc.addPage();
      startY = 40;

      // Redraw Header Row on new page
      doc.fontSize(9).fillColor('#ffffff').rect(startX, startY, 515, 20).fill('#1e3a8a');
      doc.fillColor('#ffffff');
      headers.forEach((h, i) => {
        doc.text(h, startX + i * colWidth + 5, startY + 5, { width: colWidth - 10, height: 12, ellipsis: true });
      });
      startY += 20;
      doc.fillColor('#374151');
    }

    // Zebra striping background
    if (rowIndex % 2 === 1) {
      doc.rect(startX, startY, 515, 18).fill('#f9fafb');
      doc.fillColor('#374151');
    }

    row.forEach((cell, cellIndex) => {
      doc.fontSize(8).text(String(cell ?? ''), startX + cellIndex * colWidth + 5, startY + 4, { width: colWidth - 10, height: 12, ellipsis: true });
    });

    // Thin bottom cell borders
    doc.rect(startX, startY, 515, 18).stroke('#e5e7eb');

    startY += 18;
  });

  return doc;
}

async function generateExcelReport(res, title, headers, rows, filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  worksheet.addRow([title]).font = { size: 16, bold: true, color: { argb: '1E3A8A' } };
  worksheet.addRow([]); // empty spacing row

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' },
    };
  });

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  // Automatically fit columns
  worksheet.columns.forEach((col) => {
    let maxLen = 0;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const cellLen = cell.value ? String(cell.value).length : 0;
      if (cellLen > maxLen) maxLen = cellLen;
    });
    col.width = Math.max(maxLen + 4, 12);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}

// ─────────────────────────────────────────────────────────────
// POST /api/reports/students — Students Directory Report
// ─────────────────────────────────────────────────────────────
exports.studentsReport = async (req, res) => {
  try {
    const { department, semester, format } = req.body;
    let whereClause = 'WHERE u.role = "student" AND u.is_active = 1';
    const params = [];

    if (department) {
      whereClause += ' AND sp.department = ?';
      params.push(department);
    }
    if (semester) {
      whereClause += ' AND sp.current_semester = ?';
      params.push(semester);
    }

    // Restrict faculty to view their students only
    if (req.user.role === 'faculty') {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM enrollments e
        JOIN course_assignments ca ON e.course_id = ca.course_id
        WHERE e.student_id = u.id AND ca.faculty_id = ?
      )`;
      params.push(req.user.id);
    }

    const [records] = await pool.query(
      `SELECT u.full_name, u.email, u.phone,
              sp.enrollment_id, sp.department, sp.current_semester, sp.address
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       ${whereClause}
       ORDER BY sp.department, sp.current_semester, u.full_name`,
      params
    );

    const headers = ['Student Name', 'Enrollment ID', 'Email', 'Phone', 'Department', 'Semester', 'Address'];
    const rows = records.map((r) => [
      r.full_name,
      r.enrollment_id,
      r.email,
      r.phone || 'N/A',
      r.department,
      `Semester ${r.current_semester}`,
      r.address || 'N/A',
    ]);

    if (format === 'pdf') {
      const doc = generatePDFReport('Students Directory Report', headers, rows, `Generated at: ${new Date().toLocaleDateString()}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="students-report.pdf"');
      doc.pipe(res);
      doc.end();
    } else if (format === 'excel') {
      await generateExcelReport(res, 'Students Directory', headers, rows, 'students-report.xlsx');
    } else {
      res.json({
        success: true,
        data: records,
        meta: { generated_at: new Date(), filters: { department, semester } },
      });
    }
  } catch (err) {
    console.error('studentsReport error:', err);
    res.status(500).json({ success: false, message: 'Server error generating students report' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/reports/attendance — Attendance report data
// ─────────────────────────────────────────────────────────────
exports.attendanceReport = async (req, res) => {
  try {
    const { course_id, student_id, from_date, to_date, format } = req.body;
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

    const headers = ['Student Name', 'Enrollment ID', 'Course Code', 'Date', 'Status', 'Remarks', 'Marked By'];
    const rows = records.map((r) => [
      r.student_name,
      r.enrollment_id,
      r.course_code,
      new Date(r.date).toISOString().split('T')[0],
      r.status.toUpperCase(),
      r.remarks || '',
      r.marked_by,
    ]);

    if (format === 'pdf') {
      const doc = generatePDFReport('Attendance Report', headers, rows, `Generated at: ${new Date().toLocaleDateString()}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.pdf"');
      doc.pipe(res);
      doc.end();
    } else if (format === 'excel') {
      await generateExcelReport(res, 'Attendance Report', headers, rows, 'attendance-report.xlsx');
    } else {
      res.json({
        success: true,
        data: { records, summary },
        meta: { generated_at: new Date(), filters: { course_id, student_id, from_date, to_date } },
      });
    }
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
    const { course_id, student_id, exam_type, semester, format } = req.body;
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

    const headers = ['Student Name', 'Enrollment ID', 'Course Code', 'Exam Name', 'Exam Type', 'Total Marks', 'Marks Obtained', 'Grade'];
    const rows = records.map((r) => [
      r.student_name,
      r.enrollment_id,
      r.course_code,
      r.exam_name,
      r.exam_type.toUpperCase(),
      r.total_marks,
      r.marks_obtained,
      r.grade,
    ]);

    if (format === 'pdf') {
      const doc = generatePDFReport('Grades Report', headers, rows, `Generated at: ${new Date().toLocaleDateString()}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="grades-report.pdf"');
      doc.pipe(res);
      doc.end();
    } else if (format === 'excel') {
      await generateExcelReport(res, 'Grades Report', headers, rows, 'grades-report.xlsx');
    } else {
      res.json({
        success: true,
        data: { records, cgpa_summary: cgpaRows },
        meta: { generated_at: new Date(), filters: { course_id, student_id, exam_type, semester } },
      });
    }
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
    const { from_date, to_date, fee_type, status, format } = req.body;
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

    const headers = ['Transaction ID', 'Student Name', 'Enrollment ID', 'Fee Type', 'Amount', 'Status', 'Payment Method', 'Payment Date'];
    const rows = records.map((r) => [
      r.id,
      r.student_name,
      r.enrollment_id,
      r.fee_type.toUpperCase(),
      `INR ${r.amount}`,
      r.status.toUpperCase(),
      r.payment_method || 'N/A',
      r.payment_date ? new Date(r.payment_date).toISOString().split('T')[0] : 'N/A',
    ]);

    if (format === 'pdf') {
      const doc = generatePDFReport('Fees Report', headers, rows, `Generated at: ${new Date().toLocaleDateString()}`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="fees-report.pdf"');
      doc.pipe(res);
      doc.end();
    } else if (format === 'excel') {
      await generateExcelReport(res, 'Fees Report', headers, rows, 'fees-report.xlsx');
    } else {
      res.json({
        success: true,
        data: { records, totals: totals[0] },
        meta: { generated_at: new Date(), filters: { from_date, to_date, fee_type, status } },
      });
    }
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