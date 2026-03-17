import React from 'react';
import './Common.css';

/* ── Card ─────────────────────────────────────────── */
export const Card = ({ children, className = '', style }) => (
  <div className={`card ${className}`} style={style}>{children}</div>
);

/* ── StatCard ─────────────────────────────────────── */
export const StatCard = ({ label, value, sub, variant = 'dark' }) => (
  <div className={`stat-card stat-${variant}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
    <div className="stat-ghost">{value}</div>
  </div>
);

/* ── PageHeader ───────────────────────────────────── */
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div>
      <h2 className="page-title">{title}</h2>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

/* ── Btn ──────────────────────────────────────────── */
export const Btn = ({ children, variant = 'primary', size = 'md', loading, onClick, type = 'button', disabled, className = '' }) => (
  <button
    type={type}
    className={`btn btn-${variant} btn-${size} ${className}`}
    onClick={onClick}
    disabled={disabled || loading}
  >
    {loading ? <span className="btn-spinner" /> : children}
  </button>
);

/* ── Badge / Pill ─────────────────────────────────── */
export const Badge = ({ status }) => {
  const map = {
    pending:   ['En attente', 'amber'],
    confirmed: ['Confirmé',   'green'],
    cancelled: ['Annulé',     'red'],
    completed: ['Terminé',    'gray'],
    refused:   ['Refusé',     'red'],
    waiting:   ['Attente',    'amber'],
  };
  const [label, color] = map[status] || [status, 'gray'];
  return <span className={`pill pill-${color}`}>{label}</span>;
};

/* ── Input ────────────────────────────────────────── */
export const Input = ({ label, error, ...props }) => (
  <div className="field">
    {label && <label className="field-label">{label}</label>}
    <input className={`field-input ${error ? 'field-error' : ''}`} {...props} />
    {error && <span className="field-err-msg">{error}</span>}
  </div>
);

/* ── Select ───────────────────────────────────────── */
export const Select = ({ label, error, children, ...props }) => (
  <div className="field">
    {label && <label className="field-label">{label}</label>}
    <select className={`field-select ${error ? 'field-error' : ''}`} {...props}>
      {children}
    </select>
    {error && <span className="field-err-msg">{error}</span>}
  </div>
);

/* ── Textarea ─────────────────────────────────────── */
export const Textarea = ({ label, error, ...props }) => (
  <div className="field">
    {label && <label className="field-label">{label}</label>}
    <textarea className={`field-textarea ${error ? 'field-error' : ''}`} rows={4} {...props} />
    {error && <span className="field-err-msg">{error}</span>}
  </div>
);

/* ── Modal ────────────────────────────────────────── */
export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

/* ── Empty ────────────────────────────────────────── */
export const Empty = ({ message }) => (
  <div className="empty-state">
    <div className="empty-icon">—</div>
    <p>{message || 'Aucun résultat'}</p>
  </div>
);

/* ── Stars ────────────────────────────────────────── */
export const Stars = ({ rating, max = 5 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#BA7517' : '#e0e0e0', fontSize: 14 }}>★</span>
    ))}
  </div>
);

/* ── Avatar ───────────────────────────────────────── */
export const Avatar = ({ name, size = 32, color = 'dark' }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const colors = {
    dark:  { bg: '#1a1a1a', fg: '#fff' },
    blue:  { bg: '#E6F1FB', fg: '#0C447C' },
    green: { bg: '#EAF3DE', fg: '#27500A' },
    amber: { bg: '#FAEEDA', fg: '#412402' },
  };
  const { bg, fg } = colors[color] || colors.dark;
  return (
    <div style={{
      width: size, height: size, borderRadius: size > 40 ? '50%' : 8,
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

/* ── ProgressBar ──────────────────────────────────── */
export const ProgressBar = ({ value, max, color = '#1a1a1a' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: '#888', minWidth: 32, textAlign: 'right' }}>{value}/{max}</span>
    </div>
  );
};
