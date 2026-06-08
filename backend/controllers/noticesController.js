const { validationResult } = require('express-validator');
const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// GET /api/notices — Fetch notices relevant to the current user
// ─────────────────────────────────────────────────────────────
exports.getNotices = async (req, res) => {
  try {
    const { archived = 0, course_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE n.is_archived = ?';
    const params = [parseInt(archived)];

    // Role-based visibility: users see notices targeting them or 'all'
    if (req.user.role === 'student') {
      whereClause += " AND (n.target_role = 'all' OR n.target_role = 'student')";
      // Also filter by enrolled courses if course-specific
      whereClause += ` AND (n.target_course_id IS NULL OR EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.course_id = n.target_course_id AND e.student_id = ? AND e.status = 'active'
      ))`;
      params.push(req.user.id);
    } else if (req.user.role === 'faculty') {
      whereClause += " AND (n.target_role = 'all' OR n.target_role = 'faculty')";
      whereClause += ` AND (n.target_course_id IS NULL OR EXISTS (
        SELECT 1 FROM course_assignments ca
        WHERE ca.course_id = n.target_course_id AND ca.faculty_id = ?
      ))`;
      params.push(req.user.id);
    }
    // Admin sees all notices

    if (course_id) {
      whereClause += ' AND n.target_course_id = ?';
      params.push(course_id);
    }

    const [notices] = await pool.query(
      `SELECT n.*,
              u.full_name AS posted_by_name, u.role AS posted_by_role,
              c.course_name, c.course_code
       FROM notices n
       JOIN users u ON n.posted_by_user_id = u.id
       LEFT JOIN courses c ON n.target_course_id = c.id
       ${whereClause}
       ORDER BY n.created_at DESC
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
// POST /api/notices — Admin or Faculty posts a notice
// ─────────────────────────────────────────────────────────────
exports.createNotice = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { title, content, target_role, target_course_id } = req.body;

  try {
    // Faculty can only post to their assigned courses
    if (req.user.role === 'faculty' && target_course_id) {
      const [assignment] = await pool.query(
        'SELECT id FROM course_assignments WHERE faculty_id = ? AND course_id = ?',
        [req.user.id, target_course_id]
      );
      if (!assignment.length) {
        return res.status(403).json({ success: false, message: 'You can only post to your assigned courses' });
      }
    }

    // Faculty cannot post college-wide notices (no target_course_id)
    if (req.user.role === 'faculty' && !target_course_id) {
      return res.status(403).json({ success: false, message: 'Faculty can only post course-specific notices' });
    }

    const [result] = await pool.query(
      `INSERT INTO notices (title, content, posted_by_user_id, target_role, target_course_id)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, req.user.id, target_role || 'all', target_course_id || null]
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
      // Emit to appropriate rooms based on target
      if (!target_course_id) {
        // College-wide: emit to all connected users
        io.emit('new_notice', newNotice[0]);
      } else {
        // Course-specific: emit only to users in that course room
        io.to(`course_${target_course_id}`).emit('new_notice', newNotice[0]);
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