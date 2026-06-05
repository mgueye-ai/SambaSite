'use client';

import Link from 'next/link';
import { DashboardAvatar } from './ui';

export default function DashboardLayout({
  variant = 'organizer',
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  avatarUrl,
  avatarName,
  email,
  balance,
  processing,
  headerStats,
  impersonation,
  onExitImpersonation,
  adminLink,
  onSignOut,
  children,
  toast,
}) {
  return (
    <div className={`sdc-layout sdc-${variant}`}>
      {impersonation && (
        <div className="sdc-impersonate">
          <span>Samba Team — managing as <strong>{impersonation.organizerName}</strong></span>
          <button type="button" onClick={onExitImpersonation}>Exit organizer view</button>
        </div>
      )}

      <aside className="sdc-sidebar">
        <div className="sdc-sidebar-top">
          <Link href="/" className="sdc-logo">Samba</Link>
          <span className="sdc-sidebar-badge">{variant === 'admin' ? 'Team Admin' : 'Organizer'}</span>
        </div>

        <nav className="sdc-sidebar-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`sdc-nav-item${activeTab === t.id ? ' active' : ''}`}
              onClick={() => onTabChange(t.id)}
            >
              <span className="sdc-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
              {t.count != null && <span className="sdc-nav-count">{t.count}</span>}
            </button>
          ))}
        </nav>

        <div className="sdc-sidebar-user">
          <DashboardAvatar url={avatarUrl} name={avatarName} size="sm" />
          <div>
            <strong>{avatarName}</strong>
            <span>{email}</span>
          </div>
        </div>

        <div className="sdc-sidebar-actions">
          {adminLink}
          <button type="button" className="sdc-sidebar-signout" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>

      <div className="sdc-main">
        <header className="sdc-lip">
          <div className="sdc-lip-top">
            <div>
              <p className="sdc-lip-kicker">{variant === 'admin' ? 'Platform Control' : 'Control Center'}</p>
              <h1 className="sdc-lip-title">{title}</h1>
              {subtitle && <p className="sdc-lip-sub">{subtitle}</p>}
            </div>
            {headerStats && (
              <div className="sdc-lip-stats">
                {headerStats.map((s) => (
                  <div key={s.label} className="sdc-lip-stat">
                    <span>{s.label}</span>
                    <strong>{s.value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {balance != null && (
            <div className="sdc-balance-strip">
              <div>
                <p className="sdc-balance-label">Available balance</p>
                <p className="sdc-balance-amount">{balance}</p>
              </div>
              {processing != null && (
                <div className="sdc-balance-processing">
                  <span>Processing</span>
                  <strong>{processing}</strong>
                </div>
              )}
              <button type="button" className="sdc-withdraw-btn" disabled>Withdraw in app</button>
            </div>
          )}
        </header>

        {toast && <div className="sdc-toast">{toast}</div>}

        <div className="sdc-content">
          {children}
        </div>
      </div>
    </div>
  );
}
