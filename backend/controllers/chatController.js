const pool = require('../config/db.config');

// ─────────────────────────────────────────────────────────────
// GET /api/chat/conversations
// ─────────────────────────────────────────────────────────────
exports.getConversations = async (req, res) => {
  const user_id = req.user.id;
  const role = req.user.role;
  try {
    let department = '';
    
    // Get user's department
    if (role === 'student') {
      const [deptRow] = await pool.query('SELECT department FROM student_profiles WHERE user_id = ?', [user_id]);
      if (deptRow.length) department = deptRow[0].department;
    } else if (role === 'faculty') {
      const [deptRow] = await pool.query('SELECT department FROM faculty_profiles WHERE user_id = ?', [user_id]);
      if (deptRow.length) department = deptRow[0].department;
    } else {
      // Admins can see all departments, default to CSE for mock convenience
      department = 'CSE';
    }

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department profile not found' });
    }

    // 1. Group Chats (enrolled/assigned courses)
    let groupQuery = '';
    let groupParams = [];
    if (role === 'student') {
      groupQuery = `
        SELECT c.id, c.course_code, c.course_name, 'group' AS type 
        FROM enrollments en 
        JOIN courses c ON en.course_id = c.id 
        WHERE en.student_id = ? AND en.status = 'active'
      `;
      groupParams = [user_id];
    } else if (role === 'faculty') {
      groupQuery = `
        SELECT c.id, c.course_code, c.course_name, 'group' AS type 
        FROM course_assignments ca 
        JOIN courses c ON ca.course_id = c.id 
        WHERE ca.faculty_id = ?
      `;
      groupParams = [user_id];
    } else {
      // Admin sees all courses
      groupQuery = `SELECT id, course_code, course_name, 'group' AS type FROM courses WHERE is_active = 1`;
    }
    const [courses] = await pool.query(groupQuery, groupParams);

    // 2. Direct Chats (same department student/faculty)
    const [people] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role, 'direct' AS type 
       FROM users u 
       LEFT JOIN student_profiles sp ON u.id = sp.user_id AND u.role = 'student'
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id AND u.role = 'faculty'
       WHERE (sp.department = ? OR fp.department = ?) AND u.id != ?`,
      [department, department, user_id]
    );

    res.json({
      success: true,
      data: {
        courses,
        people
      }
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ success: false, message: 'Server error loading conversations' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/chat/messages/:id
// Query param: type = 'direct' or 'group'
// ─────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  const my_id = req.user.id;
  const targetId = req.params.id;
  const type = req.query.type || 'direct';

  try {
    if (type === 'group') {
      // Get group course messages
      const [messages] = await pool.query(
        `SELECT gm.id, gm.message, gm.created_at, gm.sender_id, u.full_name AS sender_name, u.role AS sender_role
         FROM group_messages gm
         JOIN users u ON gm.sender_id = u.id
         WHERE gm.course_id = ?
         ORDER BY gm.created_at ASC`,
        [targetId]
      );
      return res.json({ success: true, data: messages });
    } else {
      // Get direct messages
      const [messages] = await pool.query(
        `SELECT dm.id, dm.message, dm.created_at, dm.sender_id, u.full_name AS sender_name, u.role AS sender_role
         FROM direct_messages dm
         JOIN users u ON dm.sender_id = u.id
         WHERE (dm.sender_id = ? AND dm.receiver_id = ?) OR (dm.sender_id = ? AND dm.receiver_id = ?)
         ORDER BY dm.created_at ASC`,
        [my_id, targetId, targetId, my_id]
      );
      return res.json({ success: true, data: messages });
    }
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ success: false, message: 'Server error loading chat history' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/chat/send
// ─────────────────────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  const sender_id = req.user.id;
  const { target_id, message, type } = req.body;

  if (!target_id || !message || !type) {
    return res.status(400).json({ success: false, message: 'target_id, message, and type are required' });
  }

  try {
    const io = req.app.get('io');
    
    // Get sender full name and role
    const [senderRows] = await pool.query('SELECT full_name, role FROM users WHERE id = ?', [sender_id]);
    const sender = senderRows[0];

    let insertedId = 0;
    const msgData = {
      message,
      sender_id,
      sender_name: sender.full_name,
      sender_role: sender.role,
      created_at: new Date()
    };

    if (type === 'group') {
      const [result] = await pool.query(
        'INSERT INTO group_messages (course_id, sender_id, message) VALUES (?, ?, ?)',
        [target_id, sender_id, message]
      );
      insertedId = result.insertId;
      msgData.id = insertedId;
      msgData.course_id = target_id;

      // Broadcast to course group room via Socket.io
      if (io) {
        io.to(`course_${target_id}`).emit('receive_message', {
          room: `course_${target_id}`,
          ...msgData,
          type: 'group'
        });
      }
    } else {
      const [result] = await pool.query(
        'INSERT INTO direct_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
        [sender_id, target_id, message]
      );
      insertedId = result.insertId;
      msgData.id = insertedId;
      msgData.receiver_id = target_id;

      // Broadcast to receiver's user room and sender's user room via Socket.io
      if (io) {
        io.to(`user_${target_id}`).emit('receive_message', {
          room: `user_${sender_id}`,
          ...msgData,
          type: 'direct'
        });
        io.to(`user_${sender_id}`).emit('receive_message', {
          room: `user_${target_id}`,
          ...msgData,
          type: 'direct'
        });
      }
    }

    res.json({
      success: true,
      data: {
        id: insertedId,
        ...msgData
      }
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Server error sending message' });
  }
};
