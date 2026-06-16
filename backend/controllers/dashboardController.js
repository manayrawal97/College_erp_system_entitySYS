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
        [coursesCount],
        [studentsCount],
        [noticesCount],
        [pendingGrades],
        [upcomingExams]
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
                    WHERE ca.faculty_id = ? AND e.exam_date >= CURDATE()`, [facultyId])
      ]);

      return res.json({
        success: true,
        data: {
          coursesCount: coursesCount.count,
          studentsCount: studentsCount.count,
          noticesCount: noticesCount.count,
          pendingGrades: pendingGrades.count,
          upcomingExams: upcomingExams.count,
          attendanceRate: '85%' // Mocked for now
        }
      });
    }

    // Admin Stats (Original logic)
    const [
      [usersCount],
      [studentsCount],
      [facultyCount],
      [activeCoursesCount],
      [enrollmentsCount],
      [pendingFees],
      [examsCount],
      [activeNoticesCount]
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
        totalUsers: usersCount.count,
        totalStudents: studentsCount.count,
        totalFaculty: facultyCount.count,
        activeCourses: activeCoursesCount.count,
        totalEnrollments: enrollmentsCount.count,
        pendingFees: pendingFees.total || 0,
        totalExams: examsCount.count,
        activeNotices: activeNoticesCount.count,
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};
