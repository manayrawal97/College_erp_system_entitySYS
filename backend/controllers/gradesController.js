const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// Grade calculation helper: marks → letter grade
const calculateGrade = (marks, totalMarks) => {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return { grade: 'A+', gradePoint: 10 };
  if (percentage >= 80) return { grade: 'A',  gradePoint: 9  };
  if (percentage >= 70) return { grade: 'B+', gradePoint: 8  };
  if (percentage >= 60) return { grade: 'B',  gradePoint: 7  };
  if (percentage >= 50) return { grade: 'C+', gradePoint: 6  };
  if (percentage >= 40) return { grade: 'C',  gradePoint: 5  };
  if (percentage >= 33) return { grade: 'D',  gradePoint: 4  };
  return { grade: 'F', gradePoint: 0 };
};

// ─────────────────────────────────────────────────────────────
// POST /api/grades/enter — Faculty enters / updates grades
// ─────────────────────────────────────────────────────────────
exports.enterGrades = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { exam_id, grades } = req.body;
  // grades = [{ student_id, marks_obtained }, ...]

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify exam exists and faculty is assigned to that course
    const [examRows] = await connection.query(
      `SELECT e.*, c.id AS course_id
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       JOIN course_assignments ca ON c.id = ca.course_id
       WHERE e.id = ? AND ca.faculty_id = ?`,
      [exam_id, req.user.id]
    );
    // Admin bypass: allow admin to enter grades too
    let exam;
    if (!examRows.length && req.user.role !== 'admin') {
      await connection.rollback();
      return res.status(403).json({ success: false, message: 'You are not authorized to enter grades for this exam' });
    }

    if (!examRows.length) {
      const [adminExam] = await connection.query('SELECT * FROM exams WHERE id = ?', [exam_id]);
      if (!adminExam.length) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }
      exam = adminExam[0];
    } else {
      exam = examRows[0];
    }

    // Insert or update each grade
    for (const record of grades) {
      const { marks_obtained } = record;
      if (marks_obtained < 0 || marks_obtained > exam.total_marks) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Marks must be between 0 and ${exam.total_marks}`,
        });
      }

      const { grade } = calculateGrade(marks_obtained, exam.total_marks);
      await connection.query(
        `INSERT INTO grades (student_id, exam_id, marks_obtained, grade, entered_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           marks_obtained = VALUES(marks_obtained),
           grade = VALUES(grade),
           entered_by = VALUES(entered_by),
           entered_at = CURRENT_TIMESTAMP`,
        [record.student_id, exam_id, marks_obtained, grade, req.user.id]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `Grades entered for ${grades.length} students` });
  } catch (err) {
    await connection.rollback();
    console.error('enterGrades error:', err);
    res.status(500).json({ success: false, message: 'Server error entering grades' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/grades/student/:studentId — Student views own grades + CGPA
// ─────────────────────────────────────────────────────────────
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own grades
    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [grades] = await pool.query(
      `SELECT g.*, e.exam_name, e.exam_date, e.total_marks, e.exam_type,
              c.course_name, c.course_code, c.credits,
              u.full_name AS entered_by_name
       FROM grades g
       JOIN exams e ON g.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON g.entered_by = u.id
       WHERE g.student_id = ?
       ORDER BY e.exam_date DESC`,
      [studentId]
    );

    // Calculate CGPA (only from 'final' exams, as per standard university practice)
    const [cgpaData] = await pool.query(
      `SELECT
         SUM(c.credits * gp.grade_point) AS weighted_sum,
         SUM(c.credits) AS total_credits,
         ROUND(SUM(c.credits * gp.grade_point) / SUM(c.credits), 2) AS cgpa
       FROM grades g
       JOIN exams e ON g.exam_id = e.id AND e.exam_type = 'final'
       JOIN courses c ON e.course_id = c.id
       JOIN (
         SELECT student_id, exam_id,
           CASE
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.90 THEN 10
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.80 THEN 9
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.70 THEN 8
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.60 THEN 7
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.50 THEN 6
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.40 THEN 5
             WHEN (marks_obtained / (SELECT total_marks FROM exams WHERE id = exam_id)) >= 0.33 THEN 4
             ELSE 0
           END AS grade_point
         FROM grades WHERE student_id = ?
       ) gp ON g.exam_id = gp.exam_id AND g.student_id = gp.student_id
       WHERE g.student_id = ?`,
      [studentId, studentId]
    );

    // Group grades by course for frontend consumption
    const byCourse = grades.reduce((acc, g) => {
      const key = g.course_code;
      if (!acc[key]) acc[key] = { course_code: g.course_code, course_name: g.course_name, credits: g.credits, exams: [] };
      acc[key].exams.push({
        exam_name: g.exam_name, exam_type: g.exam_type, exam_date: g.exam_date,
        marks_obtained: g.marks_obtained, total_marks: g.total_marks, grade: g.grade,
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        grades,
        by_course: Object.values(byCourse),
        cgpa: cgpaData[0]?.cgpa || 0,
        total_credits: cgpaData[0]?.total_credits || 0,
      },
    });
  } catch (err) {
    console.error('getStudentGrades error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/grades/course/:courseId — Faculty views all grades for their course
// ─────────────────────────────────────────────────────────────
exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { exam_id } = req.query;

    // Faculty must be assigned to this course
    if (req.user.role === 'faculty') {
      const [assignment] = await pool.query(
        'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
        [req.user.id, courseId]
      );
      if (!assignment.length) return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let whereClause = 'WHERE e.course_id = ?';
    const params = [courseId];
    if (exam_id) { whereClause += ' AND g.exam_id = ?'; params.push(exam_id); }

    const [grades] = await pool.query(
      `SELECT g.*, u.full_name AS student_name, sp.enrollment_id,
              e.exam_name, e.exam_date, e.total_marks, e.exam_type
       FROM grades g
       JOIN users u ON g.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN exams e ON g.exam_id = e.id
       ${whereClause}
       ORDER BY e.exam_date DESC, u.full_name`,
      params
    );

    // Stats per exam
    const [examStats] = await pool.query(
      `SELECT e.id, e.exam_name,
              COUNT(g.id) AS graded_count,
              ROUND(AVG(g.marks_obtained), 2) AS avg_marks,
              MAX(g.marks_obtained) AS highest,
              MIN(g.marks_obtained) AS lowest
       FROM exams e
       LEFT JOIN grades g ON e.id = g.exam_id
       WHERE e.course_id = ?
       GROUP BY e.id, e.exam_name`,
      [courseId]
    );

    res.json({ success: true, data: { grades, exam_stats: examStats } });
  } catch (err) {
    console.error('getCourseGrades error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/grades/:id — Faculty or Admin updates a single grade
// ─────────────────────────────────────────────────────────────
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks_obtained } = req.body;

    const [rows] = await pool.query(
      `SELECT g.*, e.total_marks, c.id AS course_id
       FROM grades g
       JOIN exams e ON g.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE g.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Grade record not found' });

    if (marks_obtained < 0 || marks_obtained > rows[0].total_marks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${rows[0].total_marks}`,
      });
    }

    // Faculty: verify they teach this course
    if (req.user.role === 'faculty') {
      const [assignment] = await pool.query(
        'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
        [req.user.id, rows[0].course_id]
      );
      if (!assignment.length) return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { grade } = calculateGrade(marks_obtained, rows[0].total_marks);
    await pool.query(
      'UPDATE grades SET marks_obtained = ?, grade = ?, entered_by = ?, entered_at = NOW() WHERE id = ?',
      [marks_obtained, grade, req.user.id, id]
    );

    res.json({ success: true, message: 'Grade updated successfully', data: { grade, marks_obtained } });
  } catch (err) {
    console.error('updateGrade error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/exams — Admin creates an exam
// ─────────────────────────────────────────────────────────────
exports.createExam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { course_id, exam_name, exam_date, total_marks, exam_type } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO exams (course_id, exam_name, exam_date, total_marks, exam_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [course_id, exam_name, exam_date, total_marks || 100, exam_type || 'midterm', req.user.id]
    );
    res.status(201).json({ success: true, message: 'Exam created', data: { id: result.insertId } });
  } catch (err) {
    console.error('createExam error:', err);
    res.status(500).json({ success: false, message: 'Server error creating exam' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/exams — List exams (filtered by course/role)
// ─────────────────────────────────────────────────────────────
exports.getExams = async (req, res) => {
  try {
    const { course_id } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (course_id) { whereClause += ' AND e.course_id = ?'; params.push(course_id); }

    // Students see only exams for their enrolled courses
    if (req.user.role === 'student') {
      whereClause += ' AND EXISTS (SELECT 1 FROM enrollments en WHERE en.course_id = e.course_id AND en.student_id = ? AND en.status = "active")';
      params.push(req.user.id);
    }

    // Faculty see only exams for their assigned courses
    if (req.user.role === 'faculty') {
      whereClause += ' AND EXISTS (SELECT 1 FROM course_assignments ca WHERE ca.course_id = e.course_id AND ca.faculty_id = ?)';
      params.push(req.user.id);
    }

    const [exams] = await pool.query(
      `SELECT e.*, c.course_name, c.course_code,
              u.full_name AS created_by_name
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON e.created_by = u.id
       ${whereClause}
       ORDER BY e.exam_date DESC`,
      params
    );

    res.json({ success: true, data: exams });
  } catch (err) {
    console.error('getExams error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/grades/exams/:examId/grades — Get grades for a specific exam
// ─────────────────────────────────────────────────────────────
exports.getExamGrades = async (req, res) => {
  try {
    const { examId } = req.params;

    // Faculty check: make sure they teach the course of this exam
    if (req.user.role === 'faculty') {
      const [examRows] = await pool.query(
        'SELECT course_id FROM exams WHERE id = ?',
        [examId]
      );
      if (examRows.length) {
        const [assignment] = await pool.query(
          'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
          [req.user.id, examRows[0].course_id]
        );
        if (!assignment.length) {
          return res.status(403).json({ success: false, message: 'Access denied: You do not teach this course' });
        }
      }
    }

    const [grades] = await pool.query(
      `SELECT g.id, g.student_id, g.marks_obtained, g.grade, u.full_name AS student_name, sp.enrollment_id
       FROM grades g
       JOIN users u ON g.student_id = u.id
       JOIN student_profiles sp ON u.id = sp.user_id
       WHERE g.exam_id = ?
       ORDER BY u.full_name`,
      [examId]
    );

    res.json({ success: true, data: grades });
  } catch (err) {
    console.error('getExamGrades error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching exam grades' });
  }
};