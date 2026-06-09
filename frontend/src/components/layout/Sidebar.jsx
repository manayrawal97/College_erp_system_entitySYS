import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiBook, FiCheckSquare, FiBarChart2,
  FiDollarSign, FiBell, FiFileText, FiSettings,
  FiChevronLeft, FiChevronRight, FiLogOut, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV = {
  admin: [
    { to: '/admin/dashboard',   icon: FiGrid,       label: 'Dashboard'   },
    { to: '/admin/users',       icon: FiUsers,      label: 'Users'       },
    { to: '/admin/courses',     icon: FiBook,       label: 'Courses'     },
    { to: '/admin/attendance',  icon: FiCheckSquare,label: 'Attendance'  },
    { to: '/admin/grades',      icon: FiBarChart2,  label: 'Grades'      },
    { to: '/admin/fees',        icon: FiDollarSign, label: 'Fees'        },
    { to: '/admin/notices',     icon: FiBell,       label: 'Notices'     },
    { to: '/admin/reports',     icon: FiFileText,   label: 'Reports'     },
  ],
  faculty: [
    { to: '/faculty/dashboard', icon: FiGrid,       label: 'Dashboard'   },
    { to: '/faculty/courses',   icon: FiBook,       label: 'My Courses'  },
    { to: '/faculty/attendance',icon: FiCheckSquare,label: 'Attendance'  },
    { to: '/faculty/grades',    icon: FiBarChart2,  label: 'Grades'      },
    { to: '/faculty/notices',   icon: FiBell,       label: 'Notices'     },
  ],
  student: [
    { to: '/student/dashboard', icon: FiGrid,       label: 'Dashboard'   },
    { to: '/student/courses',   icon: FiBook,       label: 'My Courses'  },
    { to: '/student/attendance',icon: FiCheckSquare,label: 'Attendance'  },
    { to: '/student/grades',    icon: FiBarChart2,  label: 'Grades'      },
    { to: '/student/fees',      icon: FiDollarSign, label: 'Fees'        },
    { to: '/student/notices',   icon: FiBell,       label: 'Notices'     },
  ],
};

const ROLE_COLOR = { admin: '#7c3aed', faculty: '#0891b2', student: '#059669' };

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navItems = NAV[user?.role] || [];

  const roleColor = ROLE_COLOR[user?.role] || 'var(--navy-600)';

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: roleColor }}>E</div>
        {!collapsed && (
          <span className="sidebar-logo-text">EntitySYS</span>
        )}
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>
      </div>

      {/* User snippet */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" style={{ background: `${roleColor}22`, color: roleColor }}>
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.full_name?.split(' ')[0]}</span>
            <span className="sidebar-user-role" style={{ color: roleColor }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && (
          <span className="sidebar-nav-section">
            {user?.role === 'admin' ? 'Administration' : 'Navigation'}
          </span>
        )}
        <ul>
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                <Icon size={17} className="sidebar-nav-icon" />
                {!collapsed && <span className="sidebar-nav-label">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <NavLink
          to={`/${user?.role}/profile`}
          className={({ isActive }) =>
            `sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`
          }
          title={collapsed ? 'Profile' : undefined}
        >
          <FiUser size={17} className="sidebar-nav-icon" />
          {!collapsed && <span className="sidebar-nav-label">Profile</span>}
        </NavLink>

        <button
          className="sidebar-nav-item sidebar-logout"
          onClick={() => { if (window.confirm('Sign out of EntitySYS?')) logout(); }}
          title={collapsed ? 'Logout' : undefined}
        >
          <FiLogOut size={17} className="sidebar-nav-icon" />
          {!collapsed && <span className="sidebar-nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}