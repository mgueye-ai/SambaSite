'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { computeOrderTotals } from '../lib/events';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

function Field({ label, children }) {
  return (
    <div className="co-field">
      <span className="co-field-label">{label}</span>
      {children}
    </div>
  );
}

export default function CheckoutForm({ event }) {
  const router = useRouter();
  const [quantities, setQuantities] = useState(null);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [joinGuestList, setJoinGuestList] = useState(true);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(`checkout_${event.id}`);
    if (!raw) { router.replace(`/events/${event.id}`); return; }
    setQuantities(JSON.parse(raw).tickets);
  }, [event.id, router]);

  const totals = quantities
    ? computeOrderTotals(event.tickets, quantities)
    : { lines: [], subtotal: 0, serviceFee: 0, total: 0, count: 0 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return; }
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

  if (!quantities) return <div className="co-loading">Loading checkout…</div>;

  return (
    <div className="co-page">
      {/* Background orbs */}
      <div className="co-orbs" />

      {/* Top nav */}
      <nav className="co-nav">
        <Link href={`/events/${event.id}`} className="co-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to event
        </Link>
        <span className="co-nav-title">Checkout</span>
        <div />
      </nav>

      <div className="co-body">

        {/* ── LEFT: event info + order summary ── */}
        <aside className="co-left">
          {event.coverImage && (
            <div className="co-cover-wrap">
              <img src={event.coverImage} alt="" className="co-cover-img"/>
              <div className="co-cover-gradient"/>
            </div>
          )}

          <div className="co-event-meta">
            <p className="co-event-title">{event.title}</p>
            {event.dateLabel && (
              <p className="co-event-detail">
                {event.dateLabel}{event.timeLabel ? ` · ${event.timeLabel}` : ''}
              </p>
            )}
            {(event.venue || event.formattedAddress) && (
              <p className="co-event-detail co-event-venue">
                {event.venue || event.formattedAddress}
              </p>
            )}
          </div>

          {/* Order summary */}
          <div className="co-summary">
            <p className="co-summary-label">Order summary</p>
            {totals.lines.map((line) => (
              <div key={line.name} className="co-summary-row">
                <span>{line.qty}× {line.name}</span>
                <span>{line.isFree ? 'Free' : fmt(line.lineTotal)}</span>
              </div>
            ))}
            <div className="co-summary-row co-summary-fee">
              <span>Service fee</span>
              <span>{fmt(totals.serviceFee)}</span>
            </div>
            <div className="co-summary-divider"/>
            <div className="co-summary-row co-summary-total">
              <span>Total</span>
              <span>{fmt(totals.total)}</span>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: form ── */}
        <main className="co-right">
          <div className="co-form-wrap">
            <h1 className="co-form-title">Complete your order</h1>
            <p className="co-form-sub">No account needed — we'll email your tickets instantly.</p>

            <form className="co-form" onSubmit={handleSubmit}>
              <Field label="Full name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="co-input"
                />
              </Field>

              <Field label="Email address">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="co-input"
                />
              </Field>

              <label className="co-checkbox">
                <input
                  type="checkbox"
                  checked={joinGuestList}
                  onChange={(e) => setJoinGuestList(e.target.checked)}
                />
                <span className="co-checkbox-box">{joinGuestList && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}</span>
                <span className="co-checkbox-label">Add me to the guest list</span>
              </label>

              <div className="co-demo-badge">
                Demo mode — no real payment taken
              </div>

              {error && <p className="co-error">{error}</p>}

              <button
                type="submit"
                className="co-submit"
                disabled={loading}
              >
                {loading ? 'Processing…' : `Complete Purchase · ${fmt(totals.total)}`}
              </button>

              <p className="co-secure">Your info is never stored on our servers.</p>
            </form>
          </div>
        </main>

      </div>
    </div>
  );
}
