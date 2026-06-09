import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiChevronDown, FiUser, FiLock, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import './Topbar.css';

const ROLE_BADGE = {
  admin:   { label: 'Admin',   bg: '#f5f3ff', color: '#7c3aed' },
  faculty: { label: 'Faculty', bg: '#ecfeff', color: '#0891b2' },
  student: { label: 'Student', bg: '#ecfdf5', color: '#059669' },
};

export default function Topbar({ pageTitle, onMenuToggle, unreadNotices = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.student;

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const noticeRoute = `/${user?.role}/notices`;
  const profileRoute = `/${user?.role}/profile`;

  return (
    <header className="topbar">
      {/* Left: hamburger + page title */}
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <FiMenu size={20} />
        </button>
        <div className="topbar-title-wrap">
          <h1 className="topbar-title">{pageTitle || 'Dashboard'}</h1>
          {/* Live indicator */}
          <span className={`topbar-live-dot ${connected ? 'connected' : 'disconnected'}`}
            title={connected ? 'Connected' : 'Reconnecting…'} />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="topbar-right">

        {/* Notification bell */}
        <button
          className="topbar-icon-btn"
          onClick={() => navigate(noticeRoute)}
          aria-label="Notices"
          title="View notices"
        >
          <FiBell size={18} />
          {unreadNotices > 0 && (
            <span className="topbar-badge">{unreadNotices > 9 ? '9+' : unreadNotices}</span>
          )}
        </button>

        {/* Profile dropdown */}
        <div className="topbar-profile-wrap" ref={dropdownRef}>
          <button
            className="topbar-profile-btn"
            onClick={() => setProfileOpen(v => !v)}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
          >
            <div className="topbar-avatar">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="topbar-user-info hide-mobile">
              <span className="topbar-user-name">{user?.full_name}</span>
              <span className="topbar-user-badge" style={{ background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
            <FiChevronDown
              size={14}
              className={`topbar-chevron ${profileOpen ? 'open' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <div className="topbar-dropdown animate-fadeDown">
              <div className="topbar-dropdown-header">
                <div className="topbar-dropdown-avatar">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="topbar-dropdown-name">{user?.full_name}</p>
                  <p className="topbar-dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item"
                onClick={() => { setProfileOpen(false); navigate(profileRoute); }}>
                <FiUser size={15} />
                <span>View Profile</span>
              </button>
              <button className="topbar-dropdown-item"
                onClick={() => { setProfileOpen(false); navigate(`${profileRoute}?tab=password`); }}>
                <FiLock size={15} />
                <span>Change Password</span>
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item topbar-dropdown-item--danger"
                onClick={handleLogout}>
                <FiLogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}