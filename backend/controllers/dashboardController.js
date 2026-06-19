const pool = require('../config/db.config');

/**
 * GET /api/dashboard/stats
 * Fetch summary counts for the dashboard KPI cards
 */
exports.getStats = async (req, res) => {
  try {
    if (req.user.role === 'faculty') {
      const facultyId = req.user.id;
      const [
        [coursesRows],
        [studentsRows],
        [noticesRows],
        [pendingRows],
        [examsRows],
        [attendanceRateRows]
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM course_assignments WHERE faculty_id = ?', [facultyId]),
        pool.query(`SELECT COUNT(DISTINCT e.student_id) as count 
                    FROM enrollments e 
                    JOIN course_assignments ca ON e.course_id = ca.course_id 
                    WHERE ca.faculty_id = ? AND e.status = 'active'`, [facultyId]),
        pool.query('SELECT COUNT(*) as count FROM notices WHERE posted_by_user_id = ? AND is_archived = 0', [facultyId]),
        pool.query(`SELECT COUNT(*) as count 
                    FROM enrollments e 
                    JOIN course_assignments ca ON e.course_id = ca.course_id 
                    JOIN exams ex ON ex.course_id = ca.course_id
                    LEFT JOIN grades g ON e.student_id = g.student_id AND ex.id = g.exam_id
                    WHERE ca.faculty_id = ? AND g.id IS NULL`, [facultyId]),
        pool.query(`SELECT COUNT(*) as count 
                    FROM exams e
                    JOIN course_assignments ca ON e.course_id = ca.course_id
                    WHERE ca.faculty_id = ? AND e.exam_date >= CURDATE()`, [facultyId]),
        pool.query(`SELECT COALESCE(ROUND(SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) / COUNT(*) * 100, 1), 0) as rate
                    FROM attendance a
                    WHERE a.course_id IN (SELECT course_id FROM course_assignments WHERE faculty_id = ?)`, [facultyId])
      ]);

      return res.json({
        success: true,
        data: {
          coursesCount: coursesRows[0]?.count || 0,
          studentsCount: studentsRows[0]?.count || 0,
          noticesCount: noticesRows[0]?.count || 0,
          pendingGrades: pendingRows[0]?.count || 0,
          upcomingExams: examsRows[0]?.count || 0,
          attendanceRate: Number(attendanceRateRows[0]?.rate || 0)
        }
      });
    }

    // Admin Stats (Original logic)
    const [
      [usersRows],
      [studentsRows],
      [facultyRows],
      [activeCoursesRows],
      [enrollmentsRows],
      [pendingFeesRows],
      [examsRows],
      [activeNoticesRows]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users WHERE is_active = 1'),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'faculty' AND is_active = 1"),
      pool.query('SELECT COUNT(*) as count FROM courses WHERE is_active = 1'),
      pool.query("SELECT COUNT(*) as count FROM enrollments WHERE status = 'active'"),
      pool.query("SELECT SUM(amount) as total FROM fee_transactions WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*) as count FROM exams'),
      pool.query('SELECT COUNT(*) as count FROM notices WHERE is_archived = 0')
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: usersRows[0]?.count || 0,
        totalStudents: studentsRows[0]?.count || 0,
        totalFaculty: facultyRows[0]?.count || 0,
        activeCourses: activeCoursesRows[0]?.count || 0,
        totalEnrollments: enrollmentsRows[0]?.count || 0,
        pendingFees: pendingFeesRows[0]?.total || 0,
        totalExams: examsRows[0]?.count || 0,
        activeNotices: activeNoticesRows[0]?.count || 0,
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};
