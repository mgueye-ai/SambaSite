'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api-client';
import CreateEventForm from '../CreateEventForm';

export default function EventEditView({ event, profile, user, organizerId, backHref }) {
  const router = useRouter();

  const handleStartEarly = async () => {
    if (!window.confirm('Start this event now? It will move to Live.')) return;
    try {
      await apiFetch(`/api/dashboard/events/${event.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ organizerId, status: 'live' }),
      });
      router.push(`/dashboard/events/${event.id}/live`);
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="evm-page evm-page-edit">
      <header className="evm-lip">
        <Link href={backHref} className="evm-back">← Events</Link>
        <span className="evm-lip-meta">Edit event</span>
        {(event.status === 'upcoming' || !event.status) && (
          <button type="button" className="evm-start-btn" onClick={handleStartEarly}>Start</button>
        )}
      </header>

      <div className="evm-body evm-edit-body">
        <CreateEventForm
          mode="edit"
          initialEvent={event}
          profile={profile}
          user={user}
          organizerId={organizerId}
          onSuccess={() => router.push(backHref)}
          onCancel={() => router.push(backHref)}
        />
      </div>
    </div>
  );
}
