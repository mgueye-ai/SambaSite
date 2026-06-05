'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '../../lib/auth';
import { apiFetch } from '../../lib/api-client';
import { getImpersonation } from '../../lib/impersonation';
import { computeEventStatus } from '../../lib/events';
import { getEventManagePath } from '../../lib/event-manage';
import EventEditView from './EventEditView';
import LiveEventStatsView from './LiveEventStatsView';
import PastEventStatsView from './PastEventStatsView';

export default function EventManagePage({ eventId, view }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const impersonation = typeof window !== 'undefined' ? getImpersonation() : null;
  const backHref = '/dashboard?tab=events';

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (!u || (u.role !== 'provider' && u.role !== 'admin')) {
          router.replace('/login');
          return;
        }
        setUser(u);

        const organizerId = impersonation?.organizerId || (u.role === 'provider' ? u.id : null);
        if (u.role === 'admin' && !organizerId) {
          router.replace('/admin');
          return;
        }

        const q = organizerId && organizerId !== u.id ? `?organizerId=${organizerId}` : '';
        const result = await apiFetch(`/api/dashboard/events/${eventId}${q}`);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, router, impersonation?.organizerId]);

  useEffect(() => {
    if (!data?.event) return;
    if (!view) {
      router.replace(getEventManagePath(data.event));
      return;
    }
    const status = data.event.status || computeEventStatus(data.event);
    const expectedView = status === 'live' ? 'live' : status === 'completed' ? 'stats' : 'edit';
    if (view !== expectedView) {
      router.replace(getEventManagePath(data.event));
    }
  }, [data, view, router]);

  if (loading) {
    return <div className="evm-loading">Loading event...</div>;
  }

  if (error || !data?.event) {
    return (
      <div className="evm-error">
        <p>{error || 'Event not found'}</p>
        <Link href={backHref}>Back to dashboard</Link>
      </div>
    );
  }

  const organizerId = impersonation?.organizerId || user?.id;
  const { event, tickets } = data;
  const profile = data.profile || null;

  const common = { event, tickets, organizerId, backHref };

  if (!view) {
    return <div className="evm-loading">Loading event...</div>;
  }

  if (view === 'live') {
    return <LiveEventStatsView {...common} />;
  }
  if (view === 'stats') {
    return <PastEventStatsView {...common} />;
  }
  return (
    <EventEditView
      event={event}
      profile={profile}
      user={user}
      organizerId={organizerId}
      backHref={backHref}
    />
  );
}
