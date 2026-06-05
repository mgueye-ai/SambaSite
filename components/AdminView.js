'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../lib/auth';
import { apiFetch } from '../lib/api-client';
import { setImpersonation } from '../lib/impersonation';

const fmt$ = (n) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
};

export default function AdminView() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('organizers');

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      if (!u || u.role !== 'admin') {
        router.replace('/admin/login');
        return;
      }
      setUser(u);
      try {
        const platform = await apiFetch('/api/admin');
        setData(platform);
      } catch {
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleImpersonate = (org) => {
    setImpersonation(org);
    router.push('/dashboard');
  };

  if (loading) return <p className="empty-note dash-loading">Loading admin panel...</p>;
  if (!data) return null;

  const filteredOrgs = data.organizers.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.organizationName?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dash-page admin-page">
      <header className="dash-header admin-header">
        <div className="dash-header-left">
          <Link href="/" className="logo">Samba</Link>
          <span className="dash-divider">/</span>
          <span className="dash-title admin-badge">Samba Team Admin</span>
        </div>
        <div className="dash-header-right">
          <div className="dash-user">
            <strong>{user.name || 'Samba Admin'}</strong>
            <span>{user.email}</span>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => { await logout(); router.push('/admin/login'); }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <nav className="dash-tabs">
        {['organizers', 'events', 'platform'].map((t) => (
          <button
            key={t}
            type="button"
            className={`dash-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <main className="dash-main dash-main-wide">
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{data.stats.totalOrganizers}</span>
            <span className="admin-stat-label">Organizers</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{data.stats.totalEvents}</span>
            <span className="admin-stat-label">Events</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{data.stats.totalTickets}</span>
            <span className="admin-stat-label">Tickets Sold</span>
          </div>
          <div className="admin-stat-card accent">
            <span className="admin-stat-value">{fmt$(data.stats.grossRevenue)}</span>
            <span className="admin-stat-label">Platform Revenue</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{data.stats.liveEvents}</span>
            <span className="admin-stat-label">Live Now</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{data.attendees}</span>
            <span className="admin-stat-label">Attendees</span>
          </div>
        </div>

        {tab === 'organizers' && (
          <div className="dash-card dash-table-card">
            <div className="dash-card-head">
              <h3>All Organizers</h3>
              <input
                type="search"
                className="admin-search"
                placeholder="Search organizers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Email</th>
                    <th>Events</th>
                    <th>Tickets</th>
                    <th>Revenue</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.length ? filteredOrgs.map((org) => (
                    <tr key={org.id}>
                      <td className="event-name">
                        {org.organizationName}
                        <span className="dash-sub">{org.name}</span>
                      </td>
                      <td>{org.email}</td>
                      <td>{org.eventCount}</td>
                      <td>{org.ticketCount}</td>
                      <td>{fmt$(org.revenue)}</td>
                      <td>
                        <span className={`status-badge status-${org.verificationStatus === 'verified' ? 'live' : 'upcoming'}`}>
                          {org.verificationStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          onClick={() => handleImpersonate(org)}
                        >
                          Manage as organizer
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="empty-note">No organizers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="dash-hint">
              Click &quot;Manage as organizer&quot; to enter their dashboard with full permissions — events, payouts, tickets, and settings.
            </p>
          </div>
        )}

        {tab === 'events' && (
          <div className="dash-card dash-table-card">
            <div className="dash-card-head">
              <h3>All Platform Events</h3>
              <span className="dash-meta">{data.events.length} events</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Status</th><th>Event</th><th>Organizer</th><th>Date</th><th>Tickets</th><th>Revenue</th><th>Link</th></tr>
                </thead>
                <tbody>
                  {data.events.map((e) => {
                    const org = data.organizers.find((o) => o.id === e.organizerId);
                    return (
                      <tr key={e.id}>
                        <td><span className={`status-badge status-${e.status}`}>{e.status}</span></td>
                        <td className="event-name">{e.title}</td>
                        <td>{org?.organizationName || e.organizerId?.slice(0, 8)}</td>
                        <td>{e.dateLabel}</td>
                        <td>{e.bookedSpots}</td>
                        <td>{fmt$(e.revenue || 0)}</td>
                        <td><Link href={`/events/${e.id}`} className="btn-ghost btn-sm">View</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'platform' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Platform Overview</h3>
              <div className="payout-row"><span>Gross Ticket Revenue</span><strong>{fmt$(data.stats.grossRevenue)}</strong></div>
              <div className="payout-row"><span>Platform Fees (10%)</span><strong>{fmt$(data.stats.platformFees)}</strong></div>
              <div className="payout-row"><span>Upcoming Events</span><strong>{data.stats.upcomingEvents}</strong></div>
              <div className="payout-row"><span>Live Events</span><strong>{data.stats.liveEvents}</strong></div>
              <div className="payout-row"><span>Admin Accounts</span><strong>{data.admins}</strong></div>
            </div>
            <div className="dash-card">
              <h3>Top Organizers by Revenue</h3>
              {data.organizers.slice(0, 8).map((org) => (
                <div key={org.id} className="payout-row">
                  <span>{org.organizationName}</span>
                  <strong>{fmt$(org.revenue)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
