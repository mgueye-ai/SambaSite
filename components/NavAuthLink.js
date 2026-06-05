'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSession, getCurrentUser } from '../lib/auth';

export default function NavAuthLink() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) {
        setReady(true);
        return;
      }
      const u = await getCurrentUser();
      if (u?.role === 'provider' || u?.role === 'admin') {
        setUser(u);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return <span className="nav-auth-link nav-auth-placeholder" />;

  if (user) {
    const href = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Link href={href} className="nav-auth-link">Dashboard</Link>;
  }

  return <Link href="/login" className="nav-auth-link">Sign in</Link>;
}
