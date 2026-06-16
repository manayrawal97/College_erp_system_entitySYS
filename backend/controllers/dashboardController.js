const pool = require('../config/db.config');

/**
 * GET /api/dashboard/stats
 * Admin only: Fetch summary counts for the dashboard KPI cards
 */
exports.getStats = async (req, res) => {
  try {
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
        totalUsers: usersCount[0].count,
        totalStudents: studentsCount[0].count,
        totalFaculty: facultyCount[0].count,
        activeCourses: activeCoursesCount[0].count,
        totalEnrollments: enrollmentsCount[0].count,
        pendingFees: pendingFees[0].total || 0,
        totalExams: examsCount[0].count,
        activeNotices: activeNoticesCount[0].count,
      }
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};
