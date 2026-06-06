'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SambaLogo from './SambaLogo';
import { checkEmail, login, logout, getSession } from '../lib/auth';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const { getCurrentUser } = await import('../lib/auth');
      const user = await getCurrentUser();
      if (user?.role === 'provider') router.replace('/dashboard');
      if (user?.role === 'admin') router.replace('/admin');
    });
  }, [router]);

  const handleEmailCheck = async () => {
    setChecking(true);
    setError('');
    const result = await checkEmail(email);
    setChecking(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setEmailChecked(true);
    if (!result.exists) {
      setError('No account found. Register as an organizer in the Samba app.');
    } else {
      setShowPassword(true);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailChecked) {
      await handleEmailCheck();
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');
    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    if (result.user.role === 'admin') {
      router.push('/admin');
      return;
    }

    if (result.user.role === 'provider') {
      router.push('/dashboard');
      return;
    }

    await logout();
    setError('This dashboard is for organizer accounts only.');
    setLoading(false);
  };

  const resetEmail = () => {
    setEmailChecked(false);
    setShowPassword(false);
    setPassword('');
    setError('');
  };

  return (
    <div className="app-login">
      <Link href="/" className="app-login-brand-link" aria-label="Samba home">
        <SambaLogo size={48} className="app-login-logo" />
      </Link>

      <form className="app-login-form" onSubmit={handleSubmit}>
        <h2 className="app-login-title">Sign in</h2>

        <div className={`app-login-input${emailChecked ? ' checked' : ''}`}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailChecked) resetEmail(); }}
            disabled={emailChecked}
            placeholder="Email"
            required
            autoComplete="email"
          />
          {checking && <span className="app-login-spinner" />}
          {emailChecked && (
            <button type="button" className="app-login-edit" onClick={resetEmail} aria-label="Change email">
              Edit
            </button>
          )}
        </div>

        {showPassword && (
          <div className="app-login-input">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <button type="button" className="app-login-edit" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password">
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        )}

        {error && <p className="app-login-error">{error}</p>}

        {showPassword && (
          <button type="submit" className="app-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        )}
      </form>

      <p className="app-login-note">
        <Link href="/">← Back to site</Link>
      </p>
    </div>
  );
}
