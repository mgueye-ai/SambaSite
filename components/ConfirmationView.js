'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fmt = (n) => `$${Number(n).toFixed(2)}`;

export default function ConfirmationView({ eventId }) {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`confirmation_${eventId}`);
    if (!raw) {
      router.replace(`/events/${eventId}`);
      return;
    }
    setData(JSON.parse(raw));
  }, [eventId, router]);

  if (!data) return <p className="empty-note">Loading...</p>;

  const { event, tickets, buyer, orderId } = data;
  const total = (tickets || []).reduce((s, t) => s + Number(t.price || 0), 0);
  const serviceFee = total * 0.1;

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h1>You&apos;re in!</h1>
        <p className="confirmation-sub">Check your email for your tickets. Show the QR code at the door.</p>

        <div className="confirmation-event">
          <h2>{event.title}</h2>
          <p>{event.dateLabel}{event.timeLabel ? ` · ${event.timeLabel}` : ''}</p>
          <p>{event.formattedAddress || event.venue}</p>
        </div>

        <div className="confirmation-details">
          <div className="detail-row"><span>Name</span><strong>{buyer.name}</strong></div>
          <div className="detail-row"><span>Email</span><strong>{buyer.email}</strong></div>
          <div className="detail-row"><span>Order</span><strong>{orderId}</strong></div>
          <div className="detail-row"><span>Total</span><strong>{fmt(total + serviceFee)}</strong></div>
        </div>

        {tickets?.length > 0 && (
          <div className="qr-list">
            <h3>Your tickets</h3>
            {tickets.map((t) => (
              <div key={t.id} className="qr-item">
                <span className="qr-type">{t.ticket_type}</span>
                <code className="qr-code">{t.qr_code}</code>
              </div>
            ))}
          </div>
        )}

        <div className="confirmation-actions">
          <Link href={`/tickets/lookup?email=${encodeURIComponent(buyer.email)}`} className="btn-secondary">
            Look up tickets
          </Link>
          <Link href="/" className="btn-primary">Back to Samba</Link>
        </div>
      </div>
    </div>
  );
}
