'use client';

import { useMemo, useState } from 'react';
import { StatusBadge } from '../dashboard/ui';

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
        placeholder="Search guests..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p className="sdc-empty">No guests yet</p>
      ) : (
        <div className="sdc-table-wrap">
          <table className="sdc-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Ticket</th>
                <th>Status</th>
                <th>Purchased</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.buyerName || 'Guest'}</strong>
                    <span className="sdc-sub">{t.buyerEmail}</span>
                  </td>
                  <td>{t.ticketType}</td>
                  <td><StatusBadge status={t.status === 'checked_in' ? 'checked_in' : 'upcoming'} /></td>
                  <td>{t.purchaseDate ? new Date(t.purchaseDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
