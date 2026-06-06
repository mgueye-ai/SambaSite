'use client';

import { useMemo, useState } from 'react';

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(name) {
  const colors = ['#7c4dff', '#e91e8c', '#00bcd4', '#ff6d00', '#43a047', '#c62828', '#1565c0', '#6a1b9a'];
  let hash = 0;
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
  return colors[Math.abs(hash)];
}

export default function EventGuestsList({ tickets }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(
      (t) => t.buyerName?.toLowerCase().includes(q) || t.buyerEmail?.toLowerCase().includes(q),
    );
  }, [tickets, query]);

  return (
    <div className="evm-guests">
      <input
        type="search"
        className="sdc-search"
        placeholder="Search guests…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="sdc-empty">No guests yet</p>
      ) : (
        <div className="evm-guest-grid">
          {filtered.map((t) => {
            const checkedIn = t.status === 'checked_in' || t.status === 'used';
            const name = t.buyerName || 'Guest';
            return (
              <div key={t.id} className={`evm-guest-card${checkedIn ? ' checked-in' : ''}`}>
                <div
                  className="evm-guest-avatar"
                  style={{ background: avatarColor(name) }}
                >
                  {initials(name)}
                  {checkedIn && <span className="evm-guest-check">✓</span>}
                </div>
                <p className="evm-guest-name">{name}</p>
                <p className="evm-guest-ticket">{t.ticketType || 'Ticket'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
