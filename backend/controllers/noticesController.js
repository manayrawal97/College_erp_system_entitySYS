const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// GET /api/notices — Fetch notices relevant to the current user
// ─────────────────────────────────────────────────────────────
exports.getNotices = async (req, res) => {
  try {
    const { archived = 0, course_id, dept, semester, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE n.is_archived = ?';
    const params = [parseInt(archived)];

    if (req.user.role === 'student') {
      // Get student profile
      const [profile] = await pool.query('SELECT department, current_semester FROM student_profiles WHERE user_id = ?', [req.user.id]);
      if (profile.length) {
        const studentDept = profile[0].department;
        const studentSem = profile[0].current_semester;
        
        whereClause += " AND (n.target_role = 'all' OR n.target_role = 'student')";
        whereClause += " AND (";
        // 1. College-wide notices
        whereClause += " (n.target_course_id IS NULL AND n.target_dept IS NULL)";
        // 2. Department wide notices
        whereClause += " OR (n.target_dept = ? AND n.target_semester IS NULL)";
        // 3. Department + Semester specific notices
        whereClause += " OR (n.target_dept = ? AND n.target_semester = ?)";
        // 4. Course specific notices
        whereClause += " OR (n.target_course_id IS NOT NULL AND EXISTS (";
        whereClause += "   SELECT 1 FROM enrollments e WHERE e.course_id = n.target_course_id AND e.student_id = ? AND e.status = 'active'";
        whereClause += " ))";
        whereClause += " )";
        
        params.push(studentDept, studentDept, studentSem, req.user.id);
      } else {
        whereClause += " AND (n.target_role = 'all' OR n.target_role = 'student') AND n.target_course_id IS NULL AND n.target_dept IS NULL";
      }
    } else if (req.user.role === 'faculty') {
      // Get faculty profile
      const [profile] = await pool.query('SELECT department FROM faculty_profiles WHERE user_id = ?', [req.user.id]);
      if (profile.length) {
        const facultyDept = profile[0].department;
        
        whereClause += " AND (n.target_role = 'all' OR n.target_role = 'faculty')";
        whereClause += " AND (";
        // 1. College-wide notices
        whereClause += " (n.target_course_id IS NULL AND n.target_dept IS NULL)";
        // 2. Department wide notices
        whereClause += " OR (n.target_dept = ?)";
        // 3. Course specific notices
        whereClause += " OR (n.target_course_id IS NOT NULL AND EXISTS (";
        whereClause += "   SELECT 1 FROM course_assignments ca WHERE ca.course_id = n.target_course_id AND ca.faculty_id = ?";
        whereClause += " ))";
        whereClause += " )";
        
        params.push(facultyDept, req.user.id);
      } else {
        whereClause += " AND (n.target_role = 'all' OR n.target_role = 'faculty') AND n.target_course_id IS NULL AND n.target_dept IS NULL";
      }
    }

    if (course_id) {
      whereClause += ' AND n.target_course_id = ?';
      params.push(course_id);
    }
    if (dept) {
      whereClause += ' AND n.target_dept = ?';
      params.push(dept);
    }
    if (semester) {
      whereClause += ' AND n.target_semester = ?';
      params.push(semester);
    }

    const [notices] = await pool.query(
      `SELECT n.*,
              u.full_name AS posted_by_name, u.role AS posted_by_role,
              c.course_name, c.course_code
       FROM notices n
       JOIN users u ON n.posted_by_user_id = u.id
       LEFT JOIN courses c ON n.target_course_id = c.id
       ${whereClause}
       ORDER BY n.is_pinned DESC, n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM notices n ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: notices,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getNotices error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching notices' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/notices/faculty — Get notices posted by the logged-in faculty
// ─────────────────────────────────────────────────────────────
exports.getFacultyNotices = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const [notices] = await pool.query(
      `SELECT n.*, c.course_name, c.course_code
       FROM notices n
       LEFT JOIN courses c ON n.target_course_id = c.id
       WHERE n.posted_by_user_id = ?
       ORDER BY n.created_at DESC`,
      [facultyId]
    );

    res.json({ success: true, data: notices });
  } catch (err) {
    console.error('getFacultyNotices error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/notices — Admin or Faculty posts a notice
// ─────────────────────────────────────────────────────────────
exports.createNotice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  let { title, content, target_role, target_course_id, course_id, target_dept, target_semester, file_url } = req.body;
  
  if (!target_course_id && course_id) target_course_id = course_id;

  try {
    // Faculty can post to assigned courses or to their department
    if (req.user.role === 'faculty') {
      const [profile] = await pool.query('SELECT department FROM faculty_profiles WHERE user_id = ?', [req.user.id]);
      const facultyDept = profile[0]?.department;
      
      if (!target_course_id && !target_dept) {
        return res.status(403).json({ success: false, message: 'Faculty can only post course-specific or department-specific notices' });
      }

      if (target_dept && target_dept !== facultyDept) {
        return res.status(403).json({ success: false, message: `You can only post notices targeting the ${facultyDept} department` });
      }

      if (target_course_id) {
        const [assignment] = await pool.query(
          'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
          [req.user.id, target_course_id]
        );
        if (!assignment.length) {
          return res.status(403).json({ success: false, message: 'You can only post to your assigned courses' });
        }
      }
    }

    const [result] = await pool.query(
      `INSERT INTO notices (title, content, posted_by_user_id, target_role, target_course_id, target_dept, target_semester, file_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, req.user.id, target_role || 'all', target_course_id || null, target_dept || null, target_semester || null, file_url || null]
    );

    // Fetch the full notice to broadcast via Socket.io
    const [newNotice] = await pool.query(
      `SELECT n.*, u.full_name AS posted_by_name, c.course_name
       FROM notices n
       JOIN users u ON n.posted_by_user_id = u.id
       LEFT JOIN courses c ON n.target_course_id = c.id
       WHERE n.id = ?`,
      [result.insertId]
    );

    // Emit real-time event via Socket.io (io is attached to app in server.js)
    const io = req.app.get('io');
    if (io) {
      if (target_course_id) {
        io.to(`course_${target_course_id}`).emit('new_notice', newNotice[0]);
      } else if (target_dept) {
        const deptRoom = `dept_${target_dept}`;
        if (target_semester) {
          const semRoom = `dept_${target_dept}_sem_${target_semester}`;
          io.to(semRoom).emit('new_notice', newNotice[0]);
        } else {
          io.to(deptRoom).emit('new_notice', newNotice[0]);
        }
        // Broadcast to relevant roles so teachers/admins see department updates
        io.to('role_faculty').emit('new_notice', newNotice[0]);
        io.to('role_admin').emit('new_notice', newNotice[0]);
      } else {
        io.emit('new_notice', newNotice[0]);
      }
    }

    res.status(201).json({ success: true, message: 'Notice posted successfully', data: newNotice[0] });
  } catch (err) {
    console.error('createNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error posting notice' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/notices/:id — Edit notice (own notices or Admin)
// ─────────────────────────────────────────────────────────────
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_archived } = req.body;

    const [rows] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Notice not found' });

    // Only the author or admin can edit
    if (req.user.role !== 'admin' && rows[0].posted_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await pool.query(
      `UPDATE notices SET
         title = COALESCE(?, title),
         content = COALESCE(?, content),
         is_archived = COALESCE(?, is_archived)
       WHERE id = ?`,
      [title || null, content || null, is_archived ?? null, id]
    );

    // Notify connected clients of the update
    const io = req.app.get('io');
    if (io) io.emit('notice_updated', { id: parseInt(id), title, is_archived });

    res.json({ success: true, message: 'Notice updated successfully' });
  } catch (err) {
    console.error('updateNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/notices/:id — Hard delete (Admin) or own (Faculty)
// ─────────────────────────────────────────────────────────────
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Notice not found' });

    if (req.user.role !== 'admin' && rows[0].posted_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await pool.query('DELETE FROM notices WHERE id = ?', [id]);

    const io = req.app.get('io');
    if (io) io.emit('notice_deleted', { id: parseInt(id) });

    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (err) {
    console.error('deleteNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/notices/:id/pin — Pin / unpin notice
// ─────────────────────────────────────────────────────────────
exports.pinNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Notice not found' });

    if (req.user.role !== 'admin' && rows[0].posted_by_user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const newPinned = rows[0].is_pinned ? 0 : 1;
    await pool.query('UPDATE notices SET is_pinned = ? WHERE id = ?', [newPinned, id]);

    const io = req.app.get('io');
    if (io) io.emit('notice_pinned_status', { id: parseInt(id), is_pinned: newPinned });

    res.json({ success: true, message: newPinned ? 'Notice pinned successfully' : 'Notice unpinned successfully', data: { is_pinned: newPinned } });
  } catch (err) {
    console.error('pinNotice error:', err);
    res.status(500).json({ success: false, message: 'Server error pinning notice' });
  }
};