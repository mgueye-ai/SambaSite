'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, getCurrentUser } from '../lib/auth';
import LoginForm from './LoginForm';

export default function DashboardLoginDropdown({ active = false }) {
  const router = useRouter();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const user = await getCurrentUser();
      if (user?.role === 'provider' || user?.role === 'admin') {
        setLoggedIn(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleButtonClick = async () => {
    if (loggedIn) {
      const user = await getCurrentUser();
      router.push(user?.role === 'admin' ? '/admin' : '/dashboard');
      return;
    }
    setOpen((o) => !o);
  };

  return (
    <div className="dash-login-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dash-nav-btn${active ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={handleButtonClick}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Dashboard</span>
        {!loggedIn && (
          <svg className="dash-nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {open && (
        <div className="dash-login-dropdown">
          <div className="dash-login-dropdown-accent" />
          <div className="dash-login-dropdown-head">
            <div>
              <p className="dash-login-dropdown-label">Samba</p>
              <p className="dash-login-dropdown-heading">Sign in</p>
            </div>
            <button type="button" className="dash-login-close" onClick={() => setOpen(false)} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <LoginForm variant="dropdown" onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
