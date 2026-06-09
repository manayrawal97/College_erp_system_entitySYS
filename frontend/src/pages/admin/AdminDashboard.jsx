import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, FiBook, FiDollarSign, FiBell,
  FiCheckSquare, FiBarChart2, FiPlusCircle, FiArrowRight
} from 'react-icons/fi';
import { usersService, coursesService, feesService, noticesService } from '../../services/api';
import { StatCard, PageHeader, EmptyState, LoadingRows } from '../../components/common';
import '../../components/common/common.css';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,        setStats]        = useState(null);
  const [recentUsers,  setRecentUsers]  = useState([]);
  const [recentFees,   setRecentFees]   = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, coursesRes, feesRes] = await Promise.all([
          usersService.getAll({ limit: 5, page: 1 }),
          coursesService.getAll({ limit: 1 }),
          feesService.getAllTransactions({ limit: 5, status: 'paid' }),
        ]);
        setStats({
          totalUsers:   usersRes.data.pagination.total,
          totalCourses: coursesRes.data.pagination.total,
          totalFees:    feesRes.data.totals?.total_collected || 0,
        });
        setRecentUsers(usersRes.data.data || []);
        setRecentFees(feesRes.data.data || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const QUICK_ACTIONS = [
    { label: 'Add Student',   icon: FiUsers,       to: '/admin/users?role=student', color: '#059669', bg: '#ecfdf5' },
    { label: 'Add Faculty',   icon: FiUsers,       to: '/admin/users?role=faculty', color: '#0891b2', bg: '#ecfeff' },
    { label: 'New Course',    icon: FiBook,        to: '/admin/courses',            color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Post Notice',   icon: FiBell,        to: '/admin/notices',            color: '#d97706', bg: '#fffbeb' },
    { label: 'View Reports',  icon: FiBarChart2,   to: '/admin/reports',            color: '#dc2626', bg: '#fef2f2' },
    { label: 'Manage Fees',   icon: FiDollarSign,  to: '/admin/fees',               color: '#1a4480', bg: '#edf3fc' },
  ];

  return (
    <div className="admin-dashboard animate-fadeUp">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Welcome back! Here's what's happening at EntitySYS today."
      />

      {/* Stats Grid */}
      <div className="admin-stats-grid stagger-children">
        <StatCard
          label="Total Users"
          value={loading ? '…' : stats?.totalUsers ?? 0}
          icon={FiUsers}
          iconBg="#edf3fc"
          iconColor="#1a4480"
        />
        <StatCard
          label="Active Courses"
          value={loading ? '…' : stats?.totalCourses ?? 0}
          icon={FiBook}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
        />
        <StatCard
          label="Fees Collected"
          value={loading ? '…' : `$${Number(stats?.totalFees ?? 0).toFixed(2)}`}
          icon={FiDollarSign}
          iconBg="#ecfdf5"
          iconColor="#059669"
        />
        <StatCard
          label="Attendance Rate"
          value="—"
          icon={FiCheckSquare}
          iconBg="#ecfeff"
          iconColor="#0891b2"
        />
      </div>

      {/* Quick Actions */}
      <section className="admin-section">
        <h3 className="admin-section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                className="quick-action-btn"
                onClick={() => navigate(a.to)}
                style={{ '--qa-color': a.color, '--qa-bg': a.bg }}
              >
                <span className="qa-icon"><Icon size={20} /></span>
                <span className="qa-label">{a.label}</span>
                <FiArrowRight size={14} className="qa-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      <div className="admin-bottom-grid">
        {/* Recent Users */}
        <section className="card admin-section--card">
          <div className="card-header">
            <h3 className="card-title">Recent Registrations</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>
              View all →
            </button>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <LoadingRows cols={4} rows={5} />
                  : recentUsers.length === 0
                  ? <tr><td colSpan={4}><EmptyState icon="👤" title="No users yet" /></td></tr>
                  : recentUsers.map(u => (
                    <tr key={u.id} className="table-row-hover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/users`)}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">
                            {u.full_name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{u.full_name}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-muted">
                        {u.student_dept || u.faculty_dept || '—'}
                      </td>
                      <td className="text-muted">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="card admin-section--card">
          <div className="card-header">
            <h3 className="card-title">Recent Payments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/fees')}>
              View all →
            </button>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <LoadingRows cols={4} rows={5} />
                  : recentFees.length === 0
                  ? <tr><td colSpan={4}><EmptyState icon="💳" title="No transactions" /></td></tr>
                  : recentFees.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <div className="user-name">{tx.student_name}</div>
                        <div className="user-email">{tx.enrollment_id}</div>
                      </td>
                      <td><strong>${Number(tx.amount).toFixed(2)}</strong></td>
                      <td className="text-muted capitalize">{tx.fee_type}</td>
                      <td>
                        <span className={`badge badge-${tx.status === 'paid' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}