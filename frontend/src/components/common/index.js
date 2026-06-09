import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

// ── StatCard ────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, iconBg, iconColor, change, changeSuffix = '' }) {
  const isUp = change > 0;
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value ?? '—'}</div>
        {change !== undefined && (
          <div className={`stat-change ${isUp ? 'up' : 'down'}`}>
            {isUp ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
            <span>{Math.abs(change)}{changeSuffix}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PageHeader ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="page-header">
      {breadcrumb && <div className="page-breadcrumb">{breadcrumb}</div>}
      <div className="page-header-inner">
        <div>
          <h2 className="page-header-title">{title}</h2>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <h3 className="empty-state-title">{title || 'No data found'}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// ── LoadingTable rows ───────────────────────────────────────
export function LoadingRows({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}>
              <div className="skeleton" style={{ height: 16, width: j === 0 ? '60%' : '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Pagination ──────────────────────────────────────────────
export function Pagination({ page, totalPages, onPrev, onNext, total, limit }) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {from}–{to} of {total}
      </span>
      <div className="pagination-controls">
        <button className="btn btn-outline btn-sm" onClick={onPrev} disabled={page <= 1}>
          ← Prev
        </button>
        <span className="pagination-page">{page} / {totalPages}</span>
        <button className="btn btn-outline btn-sm" onClick={onNext} disabled={page >= totalPages}>
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay animate-fadeIn" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal modal--${size} animate-scaleIn`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── SearchBar ───────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`search-bar ${className}`}>
      <span className="search-icon">🔍</span>
      <input
        type="search"
        className="form-input search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Tabs ────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`tab-btn ${active === tab.value ? 'tab-btn--active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className="tab-count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}