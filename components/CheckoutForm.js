'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { computeOrderTotals } from '../lib/events';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function CheckoutForm({ event }) {
  const router = useRouter();
  const [quantities, setQuantities] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [joinGuestList, setJoinGuestList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(`checkout_${event.id}`);
    if (!raw) {
      router.replace(`/events/${event.id}`);
      return;
    }
    const parsed = JSON.parse(raw);
    setQuantities(parsed.tickets);
  }, [event.id, router]);

  const totals = quantities
    ? computeOrderTotals(event.tickets, quantities)
    : { lines: [], subtotal: 0, serviceFee: 0, total: 0, count: 0 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          tickets: quantities,
          buyer: { name: name.trim(), email: email.trim().toLowerCase(), joinGuestList },
          paymentId: `demo_${Date.now()}`,
          paymentStatus: 'demo_completed',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');

      sessionStorage.setItem(
        `confirmation_${event.id}`,
        JSON.stringify({ ...data, event: { id: event.id, title: event.title, dateLabel: event.dateLabel, timeLabel: event.timeLabel, venue: event.venue, formattedAddress: event.formattedAddress } })
      );
      sessionStorage.removeItem(`checkout_${event.id}`);
      router.push(`/events/${event.id}/confirmation`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!quantities) return <p className="empty-note">Loading checkout...</p>;

  return (
    <div className="checkout-page">
      <Link href={`/events/${event.id}`} className="back-link">← Back to event</Link>
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <div>
          {event.coverImage && (
            <img src={event.coverImage} alt="" className="checkout-cover" />
          )}
          <h2>{event.title}</h2>
          <p className="event-datetime">
            {event.dateLabel}{event.timeLabel ? ` · ${event.timeLabel}` : ''}
          </p>
          <p className="event-venue">{event.formattedAddress}</p>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <p className="checkout-note">No account needed — we&apos;ll email your tickets.</p>

          <label className="field-label">Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />

          <label className="field-label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@example.com" />

          <label className="checkbox-row">
            <input type="checkbox" checked={joinGuestList} onChange={(e) => setJoinGuestList(e.target.checked)} />
            Join guest list
          </label>

          <div className="order-summary">
            <h3>Order summary</h3>
            {totals.lines.map((line) => (
              <div key={line.name} className="summary-line">
                <span>{line.qty}× {line.name}</span>
                <span>{line.isFree ? 'Free' : fmt(line.lineTotal)}</span>
              </div>
            ))}
            <div className="summary-line muted">
              <span>Service fee (10%)</span>
              <span>{fmt(totals.serviceFee)}</span>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>{fmt(totals.total)}</span>
            </div>
          </div>

          <div className="demo-badge">Demo mode — no real charge</div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Processing...' : `Complete Purchase · ${fmt(totals.total)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
