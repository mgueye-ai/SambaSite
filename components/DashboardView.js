'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout, getSession } from '../lib/auth';
import { fetchOrganizerEvents, computeDashboardStats } from '../lib/events';
import { getBrowserClient } from '../lib/supabase';

const fmt$ = (n) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
};

const PERIODS = ['day', 'week', 'month', 'year', 'all'];

export default function DashboardView() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) { router.replace('/login'); return; }

      const u = await getCurrentUser();
      if (!u || u.role !== 'provider') {
        await logout();
        router.replace('/login');
        return;
      }

      setUser(u);
      const evts = await fetchOrganizerEvents(u.id, getBrowserClient());
      setEvents(evts);
    })();
  }, [router]);

  if (!user) return <p className="empty-note">Loading dashboard...</p>;

  const stats = computeDashboardStats(events, period);
  const orgName = user.providerInfo?.organizationName || user.name;

  const topTickets = [...events].sort((a, b) => (b.bookedSpots || 0) - (a.bookedSpots || 0)).slice(0, 5);
  const maxT = Math.max(...topTickets.map((e) => e.bookedSpots || 0), 1);
  const topRev = [...events].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5);
  const maxR = Math.max(...topRev.map((e) => e.revenue || 0), 1);

  return (
    <>
      <header className="dash-header">
        <div className="dash-header-left">
          <Link href="/" className="logo">Samba</Link>
          <span className="dash-divider">/</span>
          <span className="dash-title">Analytics</span>
        </div>
        <div className="dash-header-right">
          <div className="dash-user">
            <strong>{orgName}</strong>
            <span>{user.email}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={async () => { await logout(); router.push('/login'); }}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="revenue-card">
          <div className="period-pills">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                className={`period-pill ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="revenue-amount">{fmt$(stats.revenuePeriod)}</div>
          <div className="revenue-label">
            {period === 'all' ? 'Revenue · All time' : `Revenue · This ${period}`}
          </div>
          <div className="mini-stats">
            <div className="mini-stat"><span className="mini-stat-value">{events.length}</span><span className="mini-stat-label">Events</span></div>
            <div className="mini-stat"><span className="mini-stat-value">{stats.totalTickets}</span><span className="mini-stat-label">Tickets Sold</span></div>
            <div className="mini-stat"><span className="mini-stat-value">{stats.fillRate}%</span><span className="mini-stat-label">Fill Rate</span></div>
          </div>
        </div>

        {stats.live.length > 0 && (
          <div className="live-alert">
            <span className="live-dot" />
            <span>{stats.live.length} event{stats.live.length > 1 ? 's' : ''} live right now</span>
          </div>
        )}

        <div className="dash-grid">
          <div className="dash-card">
            <h3>Event Breakdown</h3>
            <div className="breakdown-row"><span className="breakdown-dot live" /> Live <strong>{stats.live.length}</strong></div>
            <div className="breakdown-row"><span className="breakdown-dot upcoming" /> Upcoming <strong>{stats.upcoming.length}</strong></div>
            <div className="breakdown-row"><span className="breakdown-dot past" /> Past <strong>{stats.past.length}</strong></div>
          </div>

          <div className="dash-card">
            <h3>Top Events · Tickets</h3>
            {topTickets.length ? topTickets.map((e) => (
              <div key={e.id} className="bar-row">
                <span className="bar-label">{e.title}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${(e.bookedSpots / maxT) * 100}%` }} /></div>
                <span className="bar-value">{e.bookedSpots}</span>
              </div>
            )) : <p className="empty-note">No events yet</p>}
          </div>

          <div className="dash-card">
            <h3>Top Events · Revenue</h3>
            {topRev.length ? topRev.map((e) => (
              <div key={e.id} className="bar-row">
                <span className="bar-label">{e.title}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${((e.revenue || 0) / maxR) * 100}%` }} /></div>
                <span className="bar-value">{fmt$(e.revenue || 0)}</span>
              </div>
            )) : <p className="empty-note">No events yet</p>}
          </div>
        </div>

        <div className="dash-card dash-table-card">
          <h3>Your Events</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Status</th><th>Event</th><th>Date</th><th>Tickets</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {events.length ? events.map((e) => (
                  <tr key={e.id}>
                    <td><span className={`status-badge status-${e.status}`}>{e.status}</span></td>
                    <td className="event-name">
                      <Link href={`/events/${e.id}`}>{e.title}</Link>
                    </td>
                    <td>{e.dateLabel}</td>
                    <td>{e.bookedSpots}</td>
                    <td>{fmt$(e.revenue || 0)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="empty-note">No events yet — create them in the Samba app</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="dash-hint">Full scanner, live stats, and event management are in the Samba mobile app.</p>
        </div>
      </main>
    </>
  );
}
