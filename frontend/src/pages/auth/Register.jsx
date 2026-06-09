import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff,
  FiBookOpen, FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './Register.css';

const DEPARTMENTS = ['CSE', 'EE', 'EC', 'Mechanical', 'Civil'];
const SUBROLES    = ['Lecturer', 'Supervisor', 'Librarian', 'Other'];
const SEMESTERS   = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step,    setStep]    = useState(1); // 1 = role, 2 = form
  const [role,    setRole]    = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]  = useState({});

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
    department: '', current_semester: '1', parent_phone: '', address: '',
    sub_role: 'Lecturer', sub_role_custom: '', qualification: '', joining_date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())    errs.full_name    = 'Full name is required';
    if (!form.email.trim())        errs.email        = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password)            errs.password     = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password))
      errs.password = '8+ chars, uppercase, lowercase & number';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    if (!form.department)          errs.department   = 'Department is required';
    if (role === 'faculty' && form.sub_role === 'Other' && !form.sub_role_custom.trim())
      errs.sub_role_custom = 'Please specify your role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
        full_name: form.full_name.trim(),
        phone: form.phone || undefined,
        department: form.department,
        ...(role === 'student' && {
          current_semester: parseInt(form.current_semester),
          parent_phone: form.parent_phone || undefined,
          address: form.address || undefined,
        }),
        ...(role === 'faculty' && {
          sub_role: form.sub_role,
          sub_role_custom: form.sub_role === 'Other' ? form.sub_role_custom : undefined,
          qualification: form.qualification || undefined,
          joining_date: form.joining_date || undefined,
        }),
      };

      await authService.register(payload);
      toast.success('Account created! Logging you in…');
      const user = await login(payload.email, payload.password);
      const redirect = user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="register-page">
        <div className="register-container animate-fadeUp">
          <div className="register-logo">
            <span className="login-logo-icon">E</span>
            <span className="login-logo-text" style={{ color: 'var(--color-text)' }}>EntitySYS</span>
          </div>
          <h2 className="register-title">Create your account</h2>
          <p className="register-subtitle">Choose your role to get started</p>

          <div className="register-role-cards">
            {[
              { role: 'student', emoji: '🎓', label: 'Student', desc: 'Access courses, grades & attendance' },
              { role: 'faculty', emoji: '📖', label: 'Faculty', desc: 'Manage courses, mark attendance & grades' },
            ].map(r => (
              <button
                key={r.role}
                className="register-role-card"
                onClick={() => { setRole(r.role); setStep(2); }}
              >
                <span className="register-role-emoji">{r.emoji}</span>
                <span className="register-role-name">{r.label}</span>
                <span className="register-role-desc">{r.desc}</span>
                <span className="register-role-arrow">→</span>
              </button>
            ))}
          </div>

          <p className="login-register-link" style={{ marginTop: 24 }}>
            Already have an account?{' '}
            <a href="/login" className="login-link">Sign in →</a>
          </p>
        </div>
      </div>
    );
  }

  const Field = ({ label, name, type = 'text', placeholder, required, children }) => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required"> *</span>}</label>
      {children || (
        <input
          name={name} type={type} placeholder={placeholder}
          className={`form-input ${errors[name] ? 'error' : ''}`}
          value={form[name]} onChange={handleChange} disabled={loading}
        />
      )}
      {errors[name] && <p className="form-error">⚠ {errors[name]}</p>}
    </div>
  );

  return (
    <div className="register-page">
      <div className="register-container register-form-container animate-fadeUp">

        <button className="btn btn-ghost btn-sm register-back" onClick={() => setStep(1)}>
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="register-logo">
          <span className="login-logo-icon">E</span>
          <span className="login-logo-text" style={{ color: 'var(--color-text)' }}>EntitySYS</span>
        </div>
        <h2 className="register-title">
          {role === 'student' ? '🎓 Student Registration' : '📖 Faculty Registration'}
        </h2>
        <p className="register-subtitle">Fill in your details below</p>

        <form onSubmit={handleSubmit} noValidate className="register-form">

          <div className="register-section-label">Personal Information</div>
          <div className="register-grid">
            <Field label="Full Name" name="full_name" placeholder="John Smith" required>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" size={15} />
                <input name="full_name" type="text" placeholder="John Smith"
                  className={`form-input ${errors.full_name ? 'error' : ''}`}
                  value={form.full_name} onChange={handleChange} disabled={loading} />
              </div>
              {errors.full_name && <p className="form-error">⚠ {errors.full_name}</p>}
            </Field>
            <Field label="Phone Number" name="phone" placeholder="+91 9999999999">
              <div className="input-icon-wrap">
                <FiPhone className="input-icon" size={15} />
                <input name="phone" type="tel" placeholder="+91 9999999999"
                  className="form-input" value={form.phone} onChange={handleChange} disabled={loading} />
              </div>
            </Field>
          </div>

          <div className="register-section-label">Account Credentials</div>
          <Field label="Email Address" name="email" required>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" size={15} />
              <input name="email" type="email" placeholder="you@university.edu"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={form.email} onChange={handleChange} disabled={loading} />
            </div>
            {errors.email && <p className="form-error">⚠ {errors.email}</p>}
          </Field>
          <div className="register-grid">
            <Field label="Password" name="password" required>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" size={15} />
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={form.password} onChange={handleChange} disabled={loading} />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password}</p>}
            </Field>
            <Field label="Confirm Password" name="confirm_password" required>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" size={15} />
                <input name="confirm_password" type="password" placeholder="Repeat password"
                  className={`form-input ${errors.confirm_password ? 'error' : ''}`}
                  value={form.confirm_password} onChange={handleChange} disabled={loading} />
              </div>
              {errors.confirm_password && <p className="form-error">⚠ {errors.confirm_password}</p>}
            </Field>
          </div>

          <div className="register-section-label">Academic Details</div>
          <div className="register-grid">
            <div className="form-group">
              <label className="form-label">Department <span className="required">*</span></label>
              <select name="department" className={`form-select ${errors.department ? 'error' : ''}`}
                value={form.department} onChange={handleChange} disabled={loading}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="form-error">⚠ {errors.department}</p>}
            </div>

            {role === 'student' && (
              <div className="form-group">
                <label className="form-label">Current Semester</label>
                <select name="current_semester" className="form-select"
                  value={form.current_semester} onChange={handleChange} disabled={loading}>
                  {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            )}

            {role === 'faculty' && (
              <div className="form-group">
                <label className="form-label">Role / Designation <span className="required">*</span></label>
                <select name="sub_role" className="form-select"
                  value={form.sub_role} onChange={handleChange} disabled={loading}>
                  {SUBROLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {role === 'faculty' && form.sub_role === 'Other' && (
            <Field label="Specify Role" name="sub_role_custom" placeholder="e.g. Lab Instructor" required>
              <input name="sub_role_custom" type="text" placeholder="e.g. Lab Instructor"
                className={`form-input ${errors.sub_role_custom ? 'error' : ''}`}
                value={form.sub_role_custom} onChange={handleChange} disabled={loading} />
              {errors.sub_role_custom && <p className="form-error">⚠ {errors.sub_role_custom}</p>}
            </Field>
          )}

          {role === 'faculty' && (
            <div className="register-grid">
              <Field label="Qualification" name="qualification" placeholder="e.g. M.Tech, Ph.D" />
              <Field label="Joining Date" name="joining_date" type="date" />
            </div>
          )}

          {role === 'student' && (
            <>
              <Field label="Parent/Guardian Phone" name="parent_phone" placeholder="+91 9999999999" />
              <Field label="Address" name="address" placeholder="City, State">
                <textarea name="address" rows={2} placeholder="City, State"
                  className="form-textarea" value={form.address}
                  onChange={handleChange} disabled={loading} />
              </Field>
            </>
          )}

          <button type="submit"
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="login-register-link">
            Already have an account?{' '}
            <a href="/login" className="login-link">Sign in →</a>
          </p>
        </form>
      </div>
    </div>
  );
}