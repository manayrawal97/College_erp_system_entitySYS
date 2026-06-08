const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// GET /api/courses — All roles, filtered
// ─────────────────────────────────────────────────────────────
exports.getCourses = async (req, res) => {
  try {
    const { department, semester, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = 'WHERE c.is_active = 1';

    // Faculty sees only their assigned courses
    if (req.user.role === 'faculty') {
      whereClause += ' AND EXISTS (SELECT 1 FROM course_assignments ca WHERE ca.course_id = c.id AND ca.faculty_id = ?)';
      params.push(req.user.id);
    }

    // Students see only enrolled courses
    if (req.user.role === 'student') {
      whereClause += ' AND EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = ? AND e.status = "active")';
      params.push(req.user.id);
    }

    if (department) { whereClause += ' AND c.department = ?'; params.push(department); }
    if (semester)   { whereClause += ' AND c.semester = ?';   params.push(semester); }
    if (search) {
      whereClause += ' AND (c.course_name LIKE ? OR c.course_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    const [courses] = await pool.query(
      `SELECT c.*,
              u.full_name AS faculty_name, fp.employee_id,
              ca.section, ca.academic_year,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') AS enrolled_count
       FROM courses c
       LEFT JOIN course_assignments ca ON c.id = ca.course_id
       LEFT JOIN users u ON ca.faculty_id = u.id
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
       ${whereClause}
       ORDER BY c.department, c.semester, c.course_code
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM courses c ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: courses,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getCourses error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching courses' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/courses/:id — Course details + enrolled students
// ─────────────────────────────────────────────────────────────
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const [courses] = await pool.query(
      `SELECT c.*,
              u.full_name AS faculty_name, u.id AS faculty_id,
              fp.employee_id, fp.sub_role AS faculty_sub_role,
              ca.section, ca.academic_year
       FROM courses c
       LEFT JOIN course_assignments ca ON c.id = ca.course_id
       LEFT JOIN users u ON ca.faculty_id = u.id
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
       WHERE c.id = ?`,
      [id]
    );

    if (!courses.length) return res.status(404).json({ success: false, message: 'Course not found' });

    // Get enrolled students (students can see classmates' names + contact)
    const [students] = await pool.query(
      `SELECT u.id, u.full_name, u.phone, sp.enrollment_id, sp.current_semester
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN enrollments e ON u.id = e.student_id
       WHERE e.course_id = ? AND e.status = 'active' AND u.is_active = 1
       ORDER BY u.full_name`,
      [id]
    );

    res.json({ success: true, data: { ...courses[0], enrolled_students: students } });
  } catch (err) {
    console.error('getCourseById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/courses — Admin only
// ─────────────────────────────────────────────────────────────
exports.createCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { course_code, course_name, department, semester, credits, description } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM courses WHERE course_code = ?', [course_code]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Course code already exists' });

    const [result] = await pool.query(
      'INSERT INTO courses (course_code, course_name, department, semester, credits, description) VALUES (?, ?, ?, ?, ?, ?)',
      [course_code, course_name, department, semester, credits || 3, description || null]
    );

    res.status(201).json({ success: true, message: 'Course created', data: { id: result.insertId, course_code, course_name } });
  } catch (err) {
    console.error('createCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error creating course' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/courses/:id — Admin only
// ─────────────────────────────────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, department, semester, credits, description, is_active } = req.body;

    const [rows] = await pool.query('SELECT id FROM courses WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Course not found' });

    await pool.query(
      `UPDATE courses SET
         course_name = COALESCE(?, course_name),
         department  = COALESCE(?, department),
         semester    = COALESCE(?, semester),
         credits     = COALESCE(?, credits),
         description = COALESCE(?, description),
         is_active   = COALESCE(?, is_active)
       WHERE id = ?`,
      [course_name || null, department || null, semester || null,
       credits || null, description || null, is_active ?? null, id]
    );

    res.json({ success: true, message: 'Course updated successfully' });
  } catch (err) {
    console.error('updateCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error updating course' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/courses/:id — Admin only (soft delete)
// ─────────────────────────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id FROM courses WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Course not found' });

    await pool.query('UPDATE courses SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Course deactivated successfully' });
  } catch (err) {
    console.error('deleteCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/courses/:id/assign-faculty — Admin only
// ─────────────────────────────────────────────────────────────
exports.assignFaculty = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { id: course_id } = req.params;
  const { faculty_id, section, academic_year } = req.body;

  try {
    // Verify faculty exists and is actually faculty role
    const [faculty] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'faculty' AND is_active = 1",
      [faculty_id]
    );
    if (!faculty.length) return res.status(404).json({ success: false, message: 'Faculty not found or inactive' });

    // Upsert: update if assignment exists, otherwise create
    await pool.query(
      `INSERT INTO course_assignments (faculty_id, course_id, section, academic_year)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE section = VALUES(section)`,
      [faculty_id, course_id, section || 'A', academic_year || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`]
    );

    res.json({ success: true, message: 'Faculty assigned to course successfully' });
  } catch (err) {
    console.error('assignFaculty error:', err);
    res.status(500).json({ success: false, message: 'Server error assigning faculty' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/faculty/:id/courses — Faculty sees their assigned courses
// ─────────────────────────────────────────────────────────────
exports.getFacultyCourses = async (req, res) => {
  try {
    const facultyId = req.params.id;

    // Faculty can only see their own courses
    if (req.user.role === 'faculty' && req.user.id !== parseInt(facultyId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [courses] = await pool.query(
      `SELECT c.*, ca.section, ca.academic_year,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') AS enrolled_count
       FROM courses c
       JOIN course_assignments ca ON c.id = ca.course_id
       WHERE ca.faculty_id = ? AND c.is_active = 1
       ORDER BY c.department, c.course_code`,
      [facultyId]
    );

    res.json({ success: true, data: courses });
  } catch (err) {
    console.error('getFacultyCourses error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/courses/:id/enroll — Admin enrolls student in course
// ─────────────────────────────────────────────────────────────
exports.enrollStudent = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const { student_id } = req.body;

    if (!student_id) return res.status(400).json({ success: false, message: 'student_id is required' });

    // Verify student exists
    const [student] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'student' AND is_active = 1",
      [student_id]
    );
    if (!student.length) return res.status(404).json({ success: false, message: 'Student not found' });

    await pool.query(
      `INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE status = 'active'`,
      [student_id, course_id]
    );

    res.json({ success: true, message: 'Student enrolled successfully' });
  } catch (err) {
    console.error('enrollStudent error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};