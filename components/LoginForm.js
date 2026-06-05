'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkEmail, login, logout, getSession } from '../lib/auth';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      const { getCurrentUser } = await import('../lib/auth');
      const user = await getCurrentUser();
      if (user?.role === 'provider') router.replace('/dashboard');
    });
  }, [router]);

  const handleEmailCheck = async () => {
    const result = await checkEmail(email);
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

    if (result.user.role !== 'provider') {
      await logout();
      setError('This dashboard is for organizer accounts only.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="auth-card">
      <h1>Organizer Dashboard</h1>
      <p className="auth-sub">Sign in with your organizer account to view analytics and manage your events.</p>

      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="email">Email</label>
        <div className={`input-wrap ${emailChecked ? 'checked' : ''}`}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); setShowPassword(false); }}
            disabled={emailChecked}
            placeholder="you@example.com"
            required
          />
          {emailChecked && (
            <button type="button" className="input-action" onClick={() => { setEmailChecked(false); setShowPassword(false); setPassword(''); }}>
              Change
            </button>
          )}
        </div>

        {showPassword && (
          <>
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
          </>
        )}

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Signing in...' : showPassword ? 'Sign In' : 'Continue'}
        </button>
      </form>

      <p className="auth-note">
        Attendee accounts use the Samba mobile app. <Link href="/">Learn more →</Link>
      </p>
    </div>
  );
}
