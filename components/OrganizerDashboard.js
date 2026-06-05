'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../lib/auth';
import { apiFetch } from '../lib/api-client';
import { getImpersonation, clearImpersonation } from '../lib/impersonation';
import { computeDashboardStats } from '../lib/events';

const fmt$ = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
};

const PERIODS = ['day', 'week', 'month', 'year', 'all'];
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'events', label: 'Events' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'trends', label: 'Trends' },
  { id: 'guests', label: 'Guests' },
  { id: 'settings', label: 'Settings' },
];

function TrendChart({ data, valueKey = 'revenue' }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="trend-chart">
      {data.map((d) => (
        <div key={d.date} className="trend-bar-wrap" title={`${d.date}: ${valueKey === 'revenue' ? fmt$(d.revenue) : d.tickets}`}>
          <div
            className="trend-bar"
            style={{ height: `${Math.max(4, (d[valueKey] / max) * 100)}%` }}
          />
          <span className="trend-label">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const impersonation = typeof window !== 'undefined' ? getImpersonation() : null;

  const loadData = useCallback(async (organizerId) => {
    const q = organizerId ? `?organizerId=${organizerId}` : '';
    return apiFetch(`/api/dashboard${q}`);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        if (!u || (u.role !== 'provider' && u.role !== 'admin')) {
          router.replace('/login');
          return;
        }
        setUser(u);

        const imp = getImpersonation();
        const organizerId = imp?.organizerId || (u.role === 'provider' ? u.id : null);

        if (u.role === 'admin' && !organizerId) {
          router.replace('/admin');
          return;
        }

        const dash = await loadData(organizerId);
        setData(dash);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, loadData]);

  const refresh = async () => {
    const imp = getImpersonation();
    const organizerId = imp?.organizerId || user?.id;
    const dash = await loadData(organizerId);
    setData(dash);
  };

  const updateEvent = async (eventId, updates) => {
    try {
      const imp = getImpersonation();
      await apiFetch('/api/dashboard/events', {
        method: 'PATCH',
        body: JSON.stringify({
          eventId,
          organizerId: imp?.organizerId || user.id,
          ...updates,
        }),
      });
      setActionMsg('Event updated');
      await refresh();
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      setActionMsg(err.message);
    }
  };

  const events = data?.events || [];
  const stats = useMemo(() => computeDashboardStats(events, period), [events, period]);
  const orgName = impersonation?.organizerName
    || data?.profile?.providerInfo?.organizationName
    || data?.profile?.name
    || user?.providerInfo?.organizationName
    || user?.name;

  if (loading) return <p className="empty-note dash-loading">Loading dashboard...</p>;
  if (error) return <p className="error-msg dash-loading">{error}</p>;
  if (!data) return null;

  const { payouts, tickets, trends, guests, profile } = data;
  const topTickets = [...events].sort((a, b) => (b.bookedSpots || 0) - (a.bookedSpots || 0)).slice(0, 5);
  const maxT = Math.max(...topTickets.map((e) => e.bookedSpots || 0), 1);
  const topRev = [...events].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5);
  const maxR = Math.max(...topRev.map((e) => e.revenue || 0), 1);

  return (
    <div className="dash-page">
      {impersonation && (
        <div className="impersonate-banner">
          <span>
            Samba Team — managing as <strong>{impersonation.organizerName}</strong>
          </span>
          <button
            type="button"
            onClick={() => { clearImpersonation(); router.push('/admin'); }}
          >
            Exit organizer view
          </button>
        </div>
      )}

      <header className="dash-header">
        <div className="dash-header-left">
          <Link href="/" className="logo">Samba</Link>
          <span className="dash-divider">/</span>
          <span className="dash-title">Organizer Control</span>
        </div>
        <div className="dash-header-right">
          <div className="dash-user">
            <strong>{orgName}</strong>
            <span>{impersonation?.organizerEmail || user?.email}</span>
          </div>
          {user?.role === 'admin' && (
            <Link href="/admin" className="btn-ghost">Admin Panel</Link>
          )}
          <button
            type="button"
            className="btn-ghost"
            onClick={async () => { await logout(); router.push('/login'); }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <nav className="dash-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`dash-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {actionMsg && <div className="dash-toast">{actionMsg}</div>}

      <main className="dash-main dash-main-wide">
        {tab === 'overview' && (
          <>
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
                <div className="mini-stat"><span className="mini-stat-value">{fmt$(payouts.balance)}</span><span className="mini-stat-label">Balance</span></div>
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
          </>
        )}

        {tab === 'events' && (
          <div className="dash-card dash-table-card">
            <div className="dash-card-head">
              <h3>All Events — Full Control</h3>
              <span className="dash-meta">{events.length} total</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Tickets</th>
                    <th>Revenue</th>
                    <th>Sales</th>
                    <th>Explore</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length ? events.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <select
                          className="dash-select"
                          value={e.status}
                          onChange={(ev) => updateEvent(e.id, { status: ev.target.value })}
                        >
                          <option value="upcoming">upcoming</option>
                          <option value="live">live</option>
                          <option value="completed">completed</option>
                        </select>
                      </td>
                      <td className="event-name">
                        <Link href={`/events/${e.id}`}>{e.title}</Link>
                        <span className="dash-sub">{e.venue}</span>
                      </td>
                      <td>{e.dateLabel}</td>
                      <td>{e.bookedSpots} / {e.totalSpots || '∞'}</td>
                      <td>{fmt$(e.revenue || 0)}</td>
                      <td>
                        <button
                          type="button"
                          className={`toggle-pill${e.ticketSalesOpen ? ' on' : ''}`}
                          onClick={() => updateEvent(e.id, { ticket_sales_open: !e.ticketSalesOpen })}
                        >
                          {e.ticketSalesOpen ? 'Open' : 'Closed'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`toggle-pill${e.showOnExplore ? ' on' : ''}`}
                          onClick={() => updateEvent(e.id, { show_on_explore: !e.showOnExplore })}
                        >
                          {e.showOnExplore ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td>
                        <Link href={`/events/${e.id}`} className="btn-ghost btn-sm">View</Link>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={8} className="empty-note">No events yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'payouts' && (
          <div className="dash-grid">
            <div className="dash-card payout-hero">
              <h3>Available Balance</h3>
              <div className="revenue-amount">{fmt$(payouts.balance)}</div>
              <p className="dash-meta">Ready for payout after platform fees</p>
              <button type="button" className="btn-primary" disabled={payouts.balance <= 0}>
                Request Payout
              </button>
            </div>
            <div className="dash-card">
              <h3>Earnings Breakdown</h3>
              <div className="payout-row"><span>Gross Revenue</span><strong>{fmt$(payouts.grossRevenue)}</strong></div>
              <div className="payout-row"><span>Platform Fee ({payouts.platformFeeRate * 100}%)</span><strong>-{fmt$(payouts.platformFees)}</strong></div>
              <div className="payout-row"><span>Net Earnings</span><strong>{fmt$(payouts.netEarnings)}</strong></div>
              <div className="payout-row"><span>Total Paid Out</span><strong>{fmt$(payouts.paidOut)}</strong></div>
              <div className="payout-row total"><span>Balance</span><strong>{fmt$(payouts.balance)}</strong></div>
            </div>
            <div className="dash-card">
              <h3>Payout Status</h3>
              <div className="payout-row">
                <span>Verification</span>
                <span className={`status-badge status-${payouts.verificationStatus === 'verified' ? 'live' : 'upcoming'}`}>
                  {payouts.verificationStatus}
                </span>
              </div>
              <div className="payout-row">
                <span>Stripe Connect</span>
                <span>{payouts.stripeConnected ? 'Connected' : 'Not connected'}</span>
              </div>
              <p className="dash-hint">Connect Stripe in the Samba app to enable live payouts.</p>
            </div>
          </div>
        )}

        {tab === 'tickets' && (
          <div className="dash-card dash-table-card">
            <div className="dash-card-head">
              <h3>All Ticket Sales</h3>
              <span className="dash-meta">{tickets.length} tickets</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Event</th><th>Type</th><th>Buyer</th><th>Email</th><th>Price</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {tickets.length ? tickets.map((t) => (
                    <tr key={t.id}>
                      <td className="event-name">{t.eventTitle}</td>
                      <td>{t.ticketType}</td>
                      <td>{t.buyerName}</td>
                      <td>{t.buyerEmail}</td>
                      <td>{t.price === 0 ? 'Free' : fmt$(t.price)}</td>
                      <td>{new Date(t.purchaseDate).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${t.status === 'checked_in' ? 'live' : 'upcoming'}`}>{t.status}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="empty-note">No ticket sales yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'trends' && (
          <div className="dash-grid">
            <div className="dash-card dash-card-wide">
              <h3>Revenue — Last 30 Days</h3>
              <TrendChart data={trends.revenue30d} valueKey="revenue" />
            </div>
            <div className="dash-card dash-card-wide">
              <h3>Tickets Sold — Last 30 Days</h3>
              <TrendChart data={trends.revenue30d} valueKey="tickets" />
            </div>
            <div className="dash-card">
              <h3>7-Day Summary</h3>
              {trends.revenue7d.map((d) => (
                <div key={d.date} className="payout-row">
                  <span>{d.date}</span>
                  <span>{d.tickets} tickets · {fmt$(d.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'guests' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Guest Overview</h3>
              <div className="mini-stats mini-stats-col">
                <div className="mini-stat"><span className="mini-stat-value">{guests.totalBuyers}</span><span className="mini-stat-label">Unique Buyers</span></div>
                <div className="mini-stat"><span className="mini-stat-value">{guests.totalTickets}</span><span className="mini-stat-label">Total Tickets</span></div>
              </div>
            </div>
            <div className="dash-card">
              <h3>Ticket Type Breakdown</h3>
              {Object.keys(guests.ticketTypeBreakdown).length ? Object.entries(guests.ticketTypeBreakdown).map(([type, count]) => (
                <div key={type} className="payout-row"><span>{type}</span><strong>{count}</strong></div>
              )) : <p className="empty-note">No data yet</p>}
            </div>
            <div className="dash-card dash-card-wide">
              <h3>Recent Buyers</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Event</th><th>Ticket</th></tr></thead>
                  <tbody>
                    {tickets.slice(0, 20).map((t) => (
                      <tr key={t.id}>
                        <td>{t.buyerName}</td>
                        <td>{t.buyerEmail}</td>
                        <td>{t.eventTitle}</td>
                        <td>{t.ticketType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="dash-grid">
            <div className="dash-card">
              <h3>Organization</h3>
              <div className="settings-field"><label>Name</label><span>{profile?.providerInfo?.organizationName || profile?.name || '—'}</span></div>
              <div className="settings-field"><label>Email</label><span>{profile?.email}</span></div>
              <div className="settings-field"><label>Phone</label><span>{profile?.providerInfo?.partyPhone || '—'}</span></div>
              <div className="settings-field"><label>Website</label><span>{profile?.providerInfo?.website || '—'}</span></div>
            </div>
            <div className="dash-card">
              <h3>Verification</h3>
              <div className="settings-field"><label>Status</label><span className={`status-badge status-${payouts.verificationStatus === 'verified' ? 'live' : 'upcoming'}`}>{payouts.verificationStatus}</span></div>
              <div className="settings-field"><label>Tax Info</label><span>{profile?.providerInfo?.taxInfo ? 'On file' : 'Not submitted'}</span></div>
              <div className="settings-field"><label>Bank Account</label><span>{profile?.providerInfo?.bankAccountInfo ? 'On file' : 'Not submitted'}</span></div>
            </div>
            <div className="dash-card">
              <h3>Account</h3>
              <div className="settings-field"><label>User ID</label><span className="mono">{profile?.id}</span></div>
              <div className="settings-field"><label>Role</label><span>{profile?.role}</span></div>
              <div className="settings-field"><label>Member Since</label><span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
