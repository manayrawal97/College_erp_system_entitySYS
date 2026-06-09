import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiUsers, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const DEMO_CREDENTIALS = {
  admin:   { email: 'admin@entitysys.com',       password: 'Admin@123' },
  faculty: { email: 'prof.sharma@entitysys.com', password: 'Admin@123' },
  student: { email: 'alice@student.com',         password: 'Admin@123' },
};

const ROLE_CONFIG = {
  admin:   { label: 'Administrator', icon: FiShield,  color: '#7c3aed', desc: 'Full system access'       },
  faculty: { label: 'Faculty',       icon: FiBookOpen,color: '#0891b2', desc: 'Courses & grades'         },
  student: { label: 'Student',       icon: FiUsers,   color: '#059669', desc: 'Academics & attendance'   },
};

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const from = location.state?.from?.pathname || null;

  const getRoleRedirect = (role) => {
    if (from) return from;
    return role === 'admin' ? '/admin/dashboard'
         : role === 'faculty' ? '/faculty/dashboard'
         : '/student/dashboard';
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    // Auto-fill demo credentials
    const creds = DEMO_CREDENTIALS[role];
    if (creds) { setEmail(creds.email); setPassword(creds.password); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) { setError('Please select your role to continue.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password)     { setError('Password is required.'); return; }

    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}! 👋`);
      navigate(getRoleRedirect(user.role), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const creds = DEMO_CREDENTIALS[role];
    setSelectedRole(role);
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
    setLoading(true);
    try {
      const user = await login(creds.email, creds.password);
      toast.success(`Logged in as ${ROLE_CONFIG[role].label}`);
      navigate(getRoleRedirect(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            <span className="login-logo-icon">E</span>
            <span className="login-logo-text">EntitySYS</span>
          </div>
          <h1 className="login-brand-headline">
            Your university,<br />
            <em>intelligently</em> managed.
          </h1>
          <p className="login-brand-sub">
            One platform for students, faculty, and administrators.
            Real-time notices, grades, attendance — all in one place.
          </p>

          <div className="login-feature-list">
            {[
              { icon: '🎓', text: 'Student academic portal' },
              { icon: '📊', text: 'Faculty grade & attendance tools' },
              { icon: '🔔', text: 'Real-time notice board' },
              { icon: '📄', text: 'PDF admit cards & receipts' },
            ].map((f) => (
              <div key={f.text} className="login-feature-item">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <div className="login-brand-footer">
            <span>© 2024 EntitySYS University</span>
          </div>
        </div>

        {/* decorative circles */}
        <div className="login-brand-deco" />
        <div className="login-brand-deco login-brand-deco--2" />
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel">
        <div className="login-form-container animate-fadeUp">

          <div className="login-form-header">
            <h2 className="login-form-title">Sign in to your account</h2>
            <p className="login-form-subtitle">Select your role to get started</p>
          </div>

          {/* Role selector */}
          <div className="login-role-grid">
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={role}
                  type="button"
                  className={`login-role-btn ${selectedRole === role ? 'active' : ''}`}
                  style={{ '--role-color': cfg.color }}
                  onClick={() => handleRoleSelect(role)}
                >
                  <span className="login-role-icon">
                    <Icon size={18} />
                  </span>
                  <span className="login-role-label">{cfg.label}</span>
                  <span className="login-role-desc">{cfg.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Login form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert-error animate-fadeDown" role="alert">
                <span className="alert-icon">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address <span className="required">*</span>
              </label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" size={16} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="form-input"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Quick demo access */}
          <div className="divider-text" style={{ margin: '24px 0 16px' }}>
            <span>Quick demo access</span>
          </div>

          <div className="login-demo-btns">
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
              <button
                key={role}
                type="button"
                className="login-demo-btn"
                style={{ '--role-color': cfg.color }}
                onClick={() => handleDemoLogin(role)}
                disabled={loading}
              >
                <span>{cfg.label}</span>
              </button>
            ))}
          </div>

          <p className="login-register-link">
            New student?{' '}
            <a href="/register" className="login-link">Create an account →</a>
          </p>
        </div>
      </div>
    </div>
  );
}