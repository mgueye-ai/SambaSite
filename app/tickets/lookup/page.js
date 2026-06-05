'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SiteNav from '../../../components/SiteNav';

function LookupContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setTickets(null);

    try {
      const res = await fetch(`/api/tickets/lookup?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets(data.tickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('email')) lookup();
  }, []);

  return (
    <div className="lookup-page">
      <h1>Find Your Tickets</h1>
      <p className="lookup-sub">Enter the email you used at checkout to retrieve your tickets.</p>

      <form className="lookup-form" onSubmit={lookup}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Look Up'}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {tickets && (
        <div className="lookup-results">
          {tickets.length === 0 ? (
            <p className="empty-note">No tickets found for this email.</p>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="lookup-ticket">
                <h3>{t.ticket_type}</h3>
                <p className="muted">Event: {t.event_id} · Order #{t.ticket_number}</p>
                <code>{t.qr_code}</code>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function TicketLookupPage() {
  return (
    <div className="lookup-wrap">
      <SiteNav />
      <Suspense fallback={<p className="empty-note">Loading...</p>}>
        <LookupContent />
      </Suspense>
    </div>
  );
}
