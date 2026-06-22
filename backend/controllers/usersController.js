const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// GET /api/users/profile
// ─────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.is_active, u.created_at,
              sp.enrollment_id, sp.department AS student_dept, sp.current_semester, sp.parent_phone, sp.address,
              fp.employee_id, fp.department AS faculty_dept, fp.sub_role, fp.sub_role_custom, fp.qualification, fp.joining_date
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    
    const user = rows[0];
    const profileData = user.role === 'student' ? {
      enrollment_id: user.enrollment_id,
      department: user.student_dept,
      current_semester: user.current_semester,
      parent_phone: user.parent_phone,
      address: user.address
    } : user.role === 'faculty' ? {
      employee_id: user.employee_id,
      department: user.faculty_dept,
      sub_role: user.sub_role,
      sub_role_custom: user.sub_role_custom,
      qualification: user.qualification,
      joining_date: user.joining_date
    } : {};

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        created_at: user.created_at
      },
      profile: profileData
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users  — Admin: all users | Faculty: their students only
// ─────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 20, is_active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    
    let whereClause = 'WHERE 1=1';

    // Handle is_active filter
    if (is_active === 'all') {
      // No filter on is_active
    } else if (is_active === 'false' || is_active === '0' || is_active === false) {
      whereClause += ' AND u.is_active = 0';
    } else {
      // Default to active users
      whereClause += ' AND u.is_active = 1';
    }

    // Faculty can ONLY see students enrolled in their courses
    if (req.user.role === 'faculty') {
      whereClause += ` AND u.role = 'student'
        AND EXISTS (
          SELECT 1 FROM enrollments e
          JOIN course_assignments ca ON e.course_id = ca.course_id
          WHERE e.student_id = u.id AND ca.faculty_id = ?
        )`;
      params.push(req.user.id);
    } else {
      // Admin can filter by role
      if (role) { whereClause += ' AND u.role = ?'; params.push(role); }
    }

    if (department) {
      whereClause += ' AND (sp.department = ? OR fp.department = ?)';
      params.push(department, department);
    }

    if (search) {
      whereClause += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR sp.enrollment_id LIKE ? OR fp.employee_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const dataParams = [...params, parseInt(limit), offset];
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.is_active, u.created_at,
              sp.enrollment_id, sp.department AS student_dept, sp.current_semester,
              fp.employee_id, fp.department AS faculty_dept, fp.sub_role
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      dataParams
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id
// ─────────────────────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Students can only view themselves
    if (req.user.role === 'student' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.is_active, u.created_at,
              sp.enrollment_id, sp.department AS student_dept, sp.current_semester, sp.parent_phone, sp.address,
              fp.employee_id, fp.department AS faculty_dept, fp.sub_role, fp.sub_role_custom, fp.qualification, fp.joining_date
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       WHERE u.id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getUserById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/users  — Admin creates any user
// ─────────────────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password, role, full_name, phone, department, sub_role, sub_role_custom,
          qualification, joining_date, current_semester, parent_phone, address } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      'INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, password_hash, role, full_name, phone || null]
    );
    const userId = result.insertId;

    if (role === 'student') {
      const year = new Date().getFullYear();
      const [cnt] = await connection.query(
        'SELECT COUNT(*) AS c FROM student_profiles WHERE enrollment_id LIKE ?', [`STU${year}%`]
      );
      const enrollmentId = `STU${year}${String(cnt[0].c + 1).padStart(3, '0')}`;
      await connection.query(
        `INSERT INTO student_profiles (user_id, enrollment_id, department, current_semester, parent_phone, address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, enrollmentId, department, current_semester || 1, parent_phone || null, address || null]
      );
    } else if (role === 'faculty') {
      const [cnt] = await connection.query('SELECT COUNT(*) AS c FROM faculty_profiles');
      const employeeId = `FAC${String(cnt[0].c + 1).padStart(3, '0')}`;
      await connection.query(
        `INSERT INTO faculty_profiles (user_id, employee_id, department, sub_role, sub_role_custom, qualification, joining_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, employeeId, department, sub_role || 'Lecturer',
         sub_role === 'Other' ? sub_role_custom : null, qualification || null, joining_date || null]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'User created successfully', data: { id: userId, email, role, full_name } });
  } catch (err) {
    await connection.rollback();
    console.error('createUser error:', err);
    res.status(500).json({ success: false, message: 'Server error creating user' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/users/:id — Admin edits any; users can edit their own profile
// ─────────────────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let { full_name, phone, is_active, department, current_semester,
            parent_phone, address, sub_role, sub_role_custom, qualification, joining_date } = req.body;

    // Enforce role-based edit restrictions for non-admin users
    if (req.user.role !== 'admin') {
      is_active = undefined;
      department = undefined;
      current_semester = undefined;
      sub_role = undefined;
      sub_role_custom = undefined;
      joining_date = undefined;
    }

    // Only admin can toggle is_active
    const activeValue = req.user.role === 'admin' && is_active !== undefined ? is_active : rows[0].is_active;

    await connection.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), is_active = ? WHERE id = ?',
      [full_name || null, phone || null, activeValue, id]
    );

    if (rows[0].role === 'student') {
      await connection.query(
        `UPDATE student_profiles SET
           department       = COALESCE(?, department),
           current_semester = COALESCE(?, current_semester),
           parent_phone     = COALESCE(?, parent_phone),
           address          = COALESCE(?, address)
         WHERE user_id = ?`,
        [department || null, current_semester || null, parent_phone || null, address || null, id]
      );
    } else if (rows[0].role === 'faculty') {
      await connection.query(
        `UPDATE faculty_profiles SET
           department      = COALESCE(?, department),
           sub_role        = COALESCE(?, sub_role),
           sub_role_custom = COALESCE(?, sub_role_custom),
           qualification   = COALESCE(?, qualification),
           joining_date    = COALESCE(?, joining_date)
         WHERE user_id = ?`,
        [department || null, sub_role || null, sub_role_custom || null,
         qualification || null, joining_date || null, id]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('updateUser error:', err);
    res.status(500).json({ success: false, message: 'Server error updating user' });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/users/:id — Admin only (soft delete, preserves records)
// ─────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });

    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id/students — Faculty views students in their courses
// ─────────────────────────────────────────────────────────────
exports.getFacultyStudents = async (req, res) => {
  try {
    const facultyId = req.params.id;
    if (req.user.role === 'faculty' && req.user.id !== parseInt(facultyId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [students] = await pool.query(
      `SELECT DISTINCT
         u.id, u.full_name, u.email, u.phone,
         sp.enrollment_id, sp.department, sp.current_semester,
         c.id AS course_id, c.course_code, c.course_name, ca.section
       FROM users u
       JOIN student_profiles sp ON u.id = sp.user_id
       JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
       JOIN courses c ON e.course_id = c.id
       JOIN course_assignments ca ON c.id = ca.course_id
       WHERE ca.faculty_id = ? AND u.is_active = 1
       ORDER BY c.course_code, u.full_name`,
      [facultyId]
    );

    res.json({ success: true, data: students });
  } catch (err) {
    console.error('getFacultyStudents error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};