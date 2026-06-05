'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, logout, getSession, getCurrentUser } from '../lib/auth';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSession().then(async () => {
      const user = await getCurrentUser();
      if (user?.role === 'admin') router.replace('/admin');
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    if (result.user.role !== 'admin') {
      await logout();
      setError('This login is for Samba team admins only.');
      setLoading(false);
      return;
    }

    router.push('/admin');
  };

  return (
    <div className="auth-card admin-auth">
      <div className="admin-auth-badge">Samba Team</div>
      <h1>Admin Portal</h1>
      <p className="auth-sub">Sign in to manage all organizers, events, and platform data.</p>

      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="admin-email">Email</label>
        <div className="input-wrap">
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@samba.team"
            required
          />
        </div>

        <label className="field-label" htmlFor="admin-password">Password</label>
        <div className="input-wrap">
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Signing in...' : 'Sign In as Admin'}
        </button>
      </form>

      <p className="auth-note">
        Organizer? <Link href="/login">Organizer login →</Link>
      </p>
    </div>
  );
}
