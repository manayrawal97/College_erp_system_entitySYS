import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckSquare, FiBarChart2, FiDollarSign, FiCalendar, FiBook } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { attendanceService, gradesService, feesService, coursesService } from '../../services/api';
import { StatCard, PageHeader, EmptyState } from '../../components/common';
import '../../components/common/common.css';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [attRes, gradesRes, feesRes, coursesRes] = await Promise.all([
          attendanceService.getStudent(user.id),
          gradesService.getStudent(user.id),
          feesService.getStudent(user.id),
          coursesService.getAll(),
        ]);
        setData({
          attendance: attRes.data.data,
          grades:     gradesRes.data.data,
          fees:       feesRes.data.data,
          courses:    coursesRes.data.data,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  // Overall attendance % across all courses
  const overallAttendance = (() => {
    const summary = data?.attendance?.summary;
    if (!summary?.length) return null;
    const total   = summary.reduce((a, c) => a + Number(c.total_classes), 0);
    const present = summary.reduce((a, c) => a + Number(c.present_count) + Number(c.late_count), 0);
    return total ? Math.round((present / total) * 100) : 0;
  })();

  const cgpa            = data?.grades?.cgpa || 0;
  const pendingFees     = Number(data?.fees?.summary?.total_pending || 0);
  const enrolledCourses = data?.courses || [];
  const recentGrades    = data?.grades?.grades?.slice(0, 5) || [];

  return (
    <div className="student-dashboard animate-fadeUp">
      <PageHeader
        title={`Hello, ${user?.full_name?.split(' ')[0]} 👋`}
        subtitle={`Semester ${user?.current_semester || '—'} · ${user?.student_dept || user?.department || ''} · ${user?.enrollment_id || ''}`}
      />

      {/* Stats */}
      <div className="student-stats-grid stagger-children">
        <StatCard
          label="Attendance"
          value={loading ? '…' : overallAttendance !== null ? `${overallAttendance}%` : '—'}
          icon={FiCheckSquare}
          iconBg={overallAttendance !== null && overallAttendance < 75 ? '#fef2f2' : '#ecfdf5'}
          iconColor={overallAttendance !== null && overallAttendance < 75 ? '#dc2626' : '#059669'}
        />
        <StatCard
          label="Current CGPA"
          value={loading ? '…' : cgpa ? cgpa.toFixed(2) : '—'}
          icon={FiBarChart2}
          iconBg="#edf3fc"
          iconColor="#1a4480"
        />
        <StatCard
          label="Pending Fees"
          value={loading ? '…' : `$${pendingFees.toFixed(2)}`}
          icon={FiDollarSign}
          iconBg={pendingFees > 0 ? '#fffbeb' : '#ecfdf5'}
          iconColor={pendingFees > 0 ? '#d97706' : '#059669'}
        />
        <StatCard
          label="Enrolled Courses"
          value={loading ? '…' : enrolledCourses.length}
          icon={FiBook}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
        />
      </div>

      {/* Attendance alert */}
      {!loading && overallAttendance !== null && overallAttendance < 75 && (
        <div className="alert alert-warning animate-fadeDown" style={{ marginBottom: 24 }}>
          <span className="alert-icon">⚠</span>
          <span>
            Your overall attendance is <strong>{overallAttendance}%</strong> — below the required 75%.
            Contact your faculty or department for assistance.
          </span>
        </div>
      )}

      <div className="student-main-grid">
        {/* Enrolled Courses */}
        <section className="card student-card">
          <div className="card-header">
            <h3 className="card-title">Enrolled Courses</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/courses')}>
              View all →
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading
              ? <div style={{ padding: 24 }}><div className="skeleton" style={{ height: 20, marginBottom: 12 }} /><div className="skeleton" style={{ height: 20, marginBottom: 12 }} /><div className="skeleton" style={{ height: 20 }} /></div>
              : enrolledCourses.length === 0
              ? <EmptyState icon="📚" title="No courses enrolled" message="Contact admin to enroll in courses." />
              : (
                <ul className="course-list">
                  {enrolledCourses.slice(0, 6).map(course => {
                    const att = data?.attendance?.summary?.find(s => s.course_code === course.course_code);
                    const pct = att?.attendance_percentage ?? null;
                    return (
                      <li key={course.id} className="course-list-item"
                        onClick={() => navigate('/student/courses')} style={{ cursor: 'pointer' }}>
                        <div className="course-badge-code"
                          style={{ background: `hsl(${(course.id * 47) % 360}, 55%, 92%)`,
                                   color:      `hsl(${(course.id * 47) % 360}, 55%, 32%)` }}>
                          {course.course_code}
                        </div>
                        <div className="course-info">
                          <div className="course-name">{course.course_name}</div>
                          <div className="course-meta">
                            {course.faculty_name && <span>{course.faculty_name}</span>}
                            <span>Sem {course.semester}</span>
                            <span>{course.credits} credits</span>
                          </div>
                        </div>
                        {pct !== null && (
                          <div className={`course-att-pct ${pct < 75 ? 'low' : ''}`}>
                            {pct}%
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )
            }
          </div>
        </section>

        {/* Recent Grades */}
        <section className="card student-card">
          <div className="card-header">
            <h3 className="card-title">Recent Grades</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/grades')}>
              View all →
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading
              ? <div style={{ padding: 24 }}><div className="skeleton" style={{ height: 20, marginBottom: 12 }} /><div className="skeleton" style={{ height: 20 }} /></div>
              : recentGrades.length === 0
              ? <EmptyState icon="📊" title="No grades yet" message="Grades will appear here once faculty enters them." />
              : (
                <ul className="grades-list">
                  {recentGrades.map(g => (
                    <li key={g.id} className="grade-list-item">
                      <div className="grade-info">
                        <div className="grade-exam">{g.exam_name}</div>
                        <div className="grade-course">{g.course_code} · {g.exam_type}</div>
                        <div className="grade-date">
                          {new Date(g.exam_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="grade-score-wrap">
                        <div className={`grade-letter grade-${g.grade?.includes('A') ? 'a' : g.grade === 'F' ? 'f' : 'b'}`}>
                          {g.grade}
                        </div>
                        <div className="grade-marks">
                          {g.marks_obtained}/{g.total_marks}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            }
          </div>
        </section>

        {/* Attendance breakdown */}
        <section className="card student-card student-card--full">
          <div className="card-header">
            <h3 className="card-title">Attendance by Course</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/attendance')}>
              Details →
            </button>
          </div>
          <div className="card-body">
            {loading
              ? <div className="skeleton" style={{ height: 100 }} />
              : (data?.attendance?.summary?.length === 0 || !data?.attendance?.summary)
              ? <EmptyState icon="📅" title="No attendance data" />
              : (
                <div className="attendance-bars">
                  {data.attendance.summary.map(s => (
                    <div key={s.course_id} className="att-bar-row">
                      <div className="att-bar-label">
                        <span className="att-course-code">{s.course_code}</span>
                        <span className="att-course-name">{s.course_name}</span>
                      </div>
                      <div className="att-bar-track">
                        <div
                          className={`att-bar-fill ${Number(s.attendance_percentage) < 75 ? 'low' : ''}`}
                          style={{ width: `${s.attendance_percentage}%` }}
                        />
                      </div>
                      <div className={`att-pct-label ${Number(s.attendance_percentage) < 75 ? 'low' : ''}`}>
                        {s.attendance_percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </section>
      </div>
    </div>
  );
}