import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { useLocalStorage } from '../../hooks';
import './DashboardLayout.css';

// Map route segments to human-readable titles
const TITLES = {
  dashboard: 'Dashboard',
  users:     'User Management',
  courses:   'Courses',
  attendance:'Attendance',
  grades:    'Grades & Exams',
  fees:      'Fee Management',
  notices:   'Notice Board',
  reports:   'Reports',
  profile:   'My Profile',
};

function getPageTitle(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const last  = parts[parts.length - 1];
  return TITLES[last] || 'EntitySYS';
}

export default function DashboardLayout({ unreadNotices = 0 }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useLocalStorage('sidebar_collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = getPageTitle(location.pathname);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close mobile sidebar on wide screen
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(v => !v);
    } else {
      setCollapsed(v => !v);
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        className={mobileOpen ? 'sidebar--open' : ''}
      />

      <main className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          pageTitle={pageTitle}
          onMenuToggle={toggleSidebar}
          unreadNotices={unreadNotices}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}