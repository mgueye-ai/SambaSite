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
        className={`btn-nav dash-login-trigger${active ? ' active' : ''}${open ? ' open' : ''}`}
        onClick={handleButtonClick}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Organizer Dashboard
      </button>

      {open && (
        <div className="dash-login-dropdown">
          <LoginForm variant="dropdown" onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
