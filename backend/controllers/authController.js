const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// Helper: generate JWT
const generateToken = ( userId ) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

// Helper: generate unique IDs for enrollment/employee
const generateEnrollmentId = async () => {
    const year = new Date().getFullYear();
    const [rows] = await pool.query(
        'Select count(*) as count FROM student_profiles WHERE enrollment_id LIKE ?',
    [`STU${year}%`]
    );
    const count = rows[0].count + 1;
    return `STU${year}${String(count).padStart(3, '0')}`;
};

const generateEmployeeId = async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM faculty_profiles');
    const count = rows[0].count + 1;
    return `FAC${String(count).padStart(3, '0')}`;
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  // Validate incoming data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, role, full_name, phone, department, sub_role, sub_role_custom, current_semester } = req.body;

  // Use a transaction so partial writes don't corrupt the DB
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check for duplicate email
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password (10 salt rounds is the sweet spot for security/performance)
    const password_hash = await bcrypt.hash(password, 10);

    // Insert base user
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, password_hash, role, full_name, phone || null]
    );
    const userId = userResult.insertId;

    // Insert role-specific profile
    if (role === 'student') {
      const enrollmentId = await generateEnrollmentId();
      await connection.query(
        'INSERT INTO student_profiles (user_id, enrollment_id, department, current_semester) VALUES (?, ?, ?, ?)',
        [userId, enrollmentId, department, current_semester || 1]
      );
    } else if (role === 'faculty') {
      const employeeId = await generateEmployeeId();
      await connection.query(
        'INSERT INTO faculty_profiles (user_id, employee_id, department, sub_role, sub_role_custom) VALUES (?, ?, ?, ?, ?)',
        [userId, employeeId, department, sub_role || 'Lecturer', sub_role === 'Other' ? sub_role_custom : null]
      );
    }

    await connection.commit();

    const token = generateToken(userId);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: userId, email, role, full_name }
    });

  } catch (err) {
    await connection.rollback();
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  } finally {
    connection.release(); // always release back to pool
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Fetch user + profile data in one query
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.full_name, u.is_active,
              sp.enrollment_id, sp.department as student_dept, sp.current_semester,
              fp.employee_id, fp.department as faculty_dept, fp.sub_role
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) {
      // Vague message to prevent user enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    // Build profile-specific response (don't send password_hash)
    const profile = user.role === 'student'
      ? { enrollment_id: user.enrollment_id, department: user.student_dept, current_semester: user.current_semester }
      : user.role === 'faculty'
      ? { employee_id: user.employee_id, department: user.faculty_dept, sub_role: user.sub_role }
      : {};

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, ...profile }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me  (requires authentication)
// ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.phone, u.created_at,
              sp.enrollment_id, sp.department as student_dept, sp.current_semester, sp.parent_phone, sp.address,
              fp.employee_id, fp.department as faculty_dept, fp.sub_role, fp.qualification, fp.joining_date
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/change-password  (requires authentication)
// ─────────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { current_password, new_password } = req.body;

  try {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};