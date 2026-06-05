'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../lib/auth';
import { apiFetch } from '../lib/api-client';
import { getImpersonation, clearImpersonation } from '../lib/impersonation';
import { computeDashboardStats } from '../lib/events';
import DashboardLayout from './dashboard/DashboardLayout';
import {
  AreaChart, DashboardAvatar, DonutChart, EventCard, fmt$, fmtN, HBar, HeroStat,
  PeriodPills, SectionLabel, Sparkline, SdcCard, StatusBadge,
} from './dashboard/ui';

const PERIODS = ['day', 'week', 'month', 'year', 'all'];
const TABS = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'events', label: 'Events', icon: '▤' },
  { id: 'payouts', label: 'Payouts', icon: '◧' },
  { id: 'tickets', label: 'Tickets', icon: '◫' },
  { id: 'guests', label: 'Guests', icon: '◬' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function getAvatarUrl(profile, user) {
  return profile?.avatar || profile?.providerInfo?.partyLogo || profile?.profilePicture
    || user?.providerInfo?.partyLogo || user?.profilePicture || null;
}

function getDisplayName(profile, user, impersonation) {
  return impersonation?.organizerName || profile?.providerInfo?.organizationName
    || profile?.name || user?.providerInfo?.organizationName || user?.name || 'Organizer';
}

function formatAddress(addr) {
  if (!addr || typeof addr !== 'object') return null;
  const parts = [addr.street, addr.addressLine2, addr.city, addr.state, addr.zip || addr.zipCode, addr.country].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

function mergeProfile(apiProfile, clientUser) {
  if (!apiProfile && !clientUser) return null;
  const providerInfo = { ...(clientUser?.providerInfo || {}), ...(apiProfile?.providerInfo || {}) };
  return {
    ...(clientUser || {}),
    ...(apiProfile || {}),
    providerInfo,
    profilePicture: apiProfile?.profilePicture || clientUser?.profilePicture || null,
    avatar: providerInfo.partyLogo || apiProfile?.profilePicture || clientUser?.providerInfo?.partyLogo || clientUser?.profilePicture || null,
  };
}

function guestInsights(tickets) {
  const byEmail = {};
  tickets.forEach((t) => {
    const e = t.buyerEmail?.toLowerCase();
    if (!e) return;
    byEmail[e] = byEmail[e] || { name: t.buyerName, email: e, count: 0, events: new Set() };
    byEmail[e].count += 1;
    byEmail[e].events.add(t.eventId);
  });
  const buyers = Object.values(byEmail);
  const repeat = buyers.filter((b) => b.count > 1).length;
  const checkedIn = tickets.filter((t) => t.status === 'checked_in').length;
  const checkInRate = tickets.length ? Math.round((checkedIn / tickets.length) * 100) : 0;
  const topReturners = [...buyers].sort((a, b) => b.count - a.count).slice(0, 6);
  return { buyers: buyers.length, repeat, checkInRate, checkedIn, topReturners };
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [tab, setTab] = useState('overview');
  const [eventFilter, setEventFilter] = useState('all');
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
        setData(await loadData(organizerId));
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
    setData(await loadData(organizerId));
  };

  const updateEvent = async (eventId, updates) => {
    try {
      const imp = getImpersonation();
      await apiFetch('/api/dashboard/events', {
        method: 'PATCH',
        body: JSON.stringify({ eventId, organizerId: imp?.organizerId || user.id, ...updates }),
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
  const profile = mergeProfile(data?.profile, user);
  const orgName = getDisplayName(profile, user, impersonation);

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'live') return events.filter((e) => e.status === 'live');
    if (eventFilter === 'upcoming') return events.filter((e) => e.status === 'upcoming');
    if (eventFilter === 'past') return events.filter((e) => e.status === 'completed');
    return events;
  }, [events, eventFilter]);

  const guestData = useMemo(() => guestInsights(data?.tickets || []), [data?.tickets]);
  const trendRev = data?.trends?.revenue30d?.map((d) => d.revenue) || [];
  const trendLabels = data?.trends?.revenue30d?.map((d) => d.date) || [];
  const topTickets = [...events].sort((a, b) => (b.bookedSpots || 0) - (a.bookedSpots || 0)).slice(0, 6);
  const topRev = [...events].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 6);
  const maxT = Math.max(...topTickets.map((e) => e.bookedSpots || 0), 1);
  const maxR = Math.max(...topRev.map((e) => e.revenue || 0), 1);

  if (loading) return <div className="sdc-loading">Loading control center...</div>;
  if (error) return <div className="sdc-loading sdc-error">{error}</div>;
  if (!data) return null;

  const { payouts, tickets, trends, guests } = data;

  return (
    <div className="sdc-page">
      <DashboardLayout
        variant="organizer"
        title={TABS.find((t) => t.id === tab)?.label || 'Overview'}
        subtitle={orgName}
        tabs={TABS.map((t) => ({
          ...t,
          count: t.id === 'events' ? events.length : t.id === 'tickets' ? tickets.length : null,
        }))}
        activeTab={tab}
        onTabChange={setTab}
        avatarUrl={getAvatarUrl(profile, user)}
        avatarName={orgName}
        email={impersonation?.organizerEmail || profile?.email || user?.email}
        balance={fmt$(payouts.balance)}
        processing={fmt$(Math.max(0, payouts.netEarnings - payouts.balance - payouts.paidOut))}
        headerStats={[
          { label: 'Events', value: fmtN(events.length) },
          { label: 'Tickets', value: fmtN(stats.totalTickets) },
          { label: 'Live', value: fmtN(stats.live.length) },
        ]}
        impersonation={impersonation}
        onExitImpersonation={() => { clearImpersonation(); router.push('/admin'); }}
        adminLink={user?.role === 'admin' ? <Link href="/admin" className="sdc-sidebar-link">Admin panel</Link> : null}
        onSignOut={async () => { await logout(); router.push('/login'); }}
        toast={actionMsg}
      >
        {tab === 'overview' && (
          <div className="sdc-stack">
            <SdcCard className="sdc-revenue-hero">
              <PeriodPills periods={PERIODS} active={period} onChange={setPeriod} />
              <div className="sdc-revenue-row">
                <div>
                  <p className="sdc-revenue-amount">{fmt$(stats.revenuePeriod)}</p>
                  <p className="sdc-revenue-label">
                    {period === 'all' ? 'Total revenue' : `Revenue · This ${period}`}
                  </p>
                  <div className="sdc-hero-grid">
                    <HeroStat label="Events" value={fmtN(events.length)} />
                    <HeroStat label="Tickets sold" value={fmtN(stats.totalTickets)} />
                    <HeroStat label="Fill rate" value={`${stats.fillRate}%`} />
                    <HeroStat label="Net earnings" value={fmt$(payouts.netEarnings)} accent />
                  </div>
                </div>
                <Sparkline data={trendRev.length > 1 ? trendRev : [0, stats.revenuePeriod * 0.4, stats.revenuePeriod]} width={320} height={72} />
              </div>
            </SdcCard>

            {stats.live.length > 0 && (
              <div className="sdc-live-banner">
                <span className="sdc-live-dot" />
                <span>{stats.live.length} event{stats.live.length > 1 ? 's' : ''} live right now</span>
                <button type="button" onClick={() => { setTab('events'); setEventFilter('live'); }}>View live</button>
              </div>
            )}

            <div className="sdc-grid-2">
              <SdcCard title="Revenue trend" meta="Last 30 days" wide>
                <AreaChart data={trendRev} labels={trendLabels} />
              </SdcCard>
              <SdcCard title="Ticket sales" meta="Last 30 days" wide>
                <AreaChart
                  data={trends.revenue30d?.map((d) => d.tickets) || []}
                  labels={trendLabels}
                  color="#60a5fa"
                  formatY={fmtN}
                />
              </SdcCard>
            </div>

            <div className="sdc-grid-3">
              <SdcCard title="Event breakdown">
                <DonutChart segments={[
                  { label: 'Live', value: stats.live.length, color: '#4ade80' },
                  { label: 'Upcoming', value: stats.upcoming.length, color: '#FF4B8C' },
                  { label: 'Past', value: stats.past.length, color: '#a78bfa' },
                ]} />
              </SdcCard>
              <SdcCard title="Top events · tickets">
                {topTickets.length ? topTickets.map((e) => (
                  <HBar key={e.id} label={e.title} value={e.bookedSpots || 0} maxValue={maxT} />
                )) : <p className="sdc-empty">No events yet</p>}
              </SdcCard>
              <SdcCard title="Top events · revenue">
                {topRev.length ? topRev.map((e) => (
                  <HBar key={e.id} label={e.title} value={e.revenue || 0} maxValue={maxR} color="#a78bfa" display={fmt$(e.revenue || 0)} />
                )) : <p className="sdc-empty">No events yet</p>}
              </SdcCard>
            </div>

            <div className="sdc-grid-2">
              <SdcCard title="Guest pulse">
                <div className="sdc-hero-grid">
                  <HeroStat label="Unique buyers" value={fmtN(guests.totalBuyers)} />
                  <HeroStat label="Returning" value={fmtN(guestData.repeat)} />
                  <HeroStat label="Check-in rate" value={`${guestData.checkInRate}%`} />
                  <HeroStat label="Avg / event" value={events.length ? fmtN(Math.round(guests.totalTickets / events.length)) : '0'} />
                </div>
              </SdcCard>
              <SdcCard title="Recent sales" meta={`${tickets.length} total`}>
                {tickets.slice(0, 6).map((t) => (
                  <div key={t.id} className="sdc-list-row">
                    <div>
                      <strong>{t.buyerName}</strong>
                      <span>{t.eventTitle} · {t.ticketType}</span>
                    </div>
                    <span>{t.price === 0 ? 'Free' : fmt$(t.price)}</span>
                  </div>
                ))}
                {!tickets.length && <p className="sdc-empty">No ticket sales yet</p>}
              </SdcCard>
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="sdc-stack">
            <div className="sdc-filter-pills">
              {['all', 'upcoming', 'live', 'past'].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`sdc-filter${eventFilter === f ? ' active' : ''}`}
                  onClick={() => setEventFilter(f)}
                >
                  {f === 'past' ? 'Past' : f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === 'live' && stats.live.length > 0 && <span className="sdc-filter-dot" />}
                </button>
              ))}
            </div>
            <div className="sdc-event-grid">
              {filteredEvents.length ? filteredEvents.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  onToggleSales={() => updateEvent(e.id, { ticket_sales_open: !e.ticketSalesOpen })}
                  onToggleExplore={() => updateEvent(e.id, { show_on_explore: !e.showOnExplore })}
                />
              )) : <p className="sdc-empty">No events in this category</p>}
            </div>
            <SdcCard title="Event manager" meta="Full table view">
              <div className="sdc-table-wrap">
                <table className="sdc-table">
                  <thead>
                    <tr><th>Status</th><th>Event</th><th>Date</th><th>Sold</th><th>Revenue</th><th>Sales</th><th>Explore</th></tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <select className="sdc-select" value={e.status} onChange={(ev) => updateEvent(e.id, { status: ev.target.value })}>
                            <option value="upcoming">upcoming</option>
                            <option value="live">live</option>
                            <option value="completed">completed</option>
                          </select>
                        </td>
                        <td><Link href={`/events/${e.id}`}>{e.title}</Link><span className="sdc-sub">{e.venue}</span></td>
                        <td>{e.dateLabel}</td>
                        <td>{e.bookedSpots} / {e.totalSpots || '∞'}</td>
                        <td>{fmt$(e.revenue || 0)}</td>
                        <td><StatusBadge status={e.ticketSalesOpen ? 'live' : 'past'} /></td>
                        <td><StatusBadge status={e.showOnExplore ? 'live' : 'past'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SdcCard>
          </div>
        )}

        {tab === 'payouts' && (
          <div className="sdc-grid-2">
            <SdcCard title="Available balance" className="sdc-payout-hero">
              <p className="sdc-revenue-amount">{fmt$(payouts.balance)}</p>
              <p className="sdc-revenue-label">Ready after platform fees</p>
              <button type="button" className="sdc-withdraw-btn" disabled={payouts.balance <= 0}>Request payout in app</button>
            </SdcCard>
            <SdcCard title="Earnings breakdown">
              <div className="sdc-kv"><span>Gross revenue</span><strong>{fmt$(payouts.grossRevenue)}</strong></div>
              <div className="sdc-kv"><span>Platform fee ({payouts.platformFeeRate * 100}%)</span><strong>-{fmt$(payouts.platformFees)}</strong></div>
              <div className="sdc-kv"><span>Net earnings</span><strong>{fmt$(payouts.netEarnings)}</strong></div>
              <div className="sdc-kv"><span>Paid out</span><strong>{fmt$(payouts.paidOut)}</strong></div>
              <div className="sdc-kv total"><span>Balance</span><strong>{fmt$(payouts.balance)}</strong></div>
            </SdcCard>
            <SdcCard title="Payout status">
              <div className="sdc-kv"><span>Verification</span><StatusBadge status={payouts.verificationStatus} /></div>
              <div className="sdc-kv"><span>Stripe Connect</span><strong>{payouts.stripeConnected ? 'Connected' : 'Not connected'}</strong></div>
              <p className="sdc-hint">Connect Stripe in the Samba app to enable live payouts.</p>
            </SdcCard>
            <SdcCard title="Fee structure">
              <div className="sdc-fee-split">
                <div><span>You keep</span><strong>90%</strong></div>
                <div><span>Platform</span><strong>10%</strong></div>
              </div>
              <SectionLabel>All ticket sales · automatic deduction</SectionLabel>
            </SdcCard>
          </div>
        )}

        {tab === 'tickets' && (
          <SdcCard title="All ticket sales" meta={`${tickets.length} tickets`}>
            <div className="sdc-table-wrap">
              <table className="sdc-table">
                <thead>
                  <tr><th>Event</th><th>Type</th><th>Buyer</th><th>Email</th><th>Price</th><th>Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {tickets.length ? tickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.eventTitle}</td>
                      <td>{t.ticketType}</td>
                      <td>{t.buyerName}</td>
                      <td>{t.buyerEmail}</td>
                      <td>{t.price === 0 ? 'Free' : fmt$(t.price)}</td>
                      <td>{new Date(t.purchaseDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={t.status} /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="sdc-empty">No ticket sales yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SdcCard>
        )}

        {tab === 'guests' && (
          <div className="sdc-stack">
            <div className="sdc-hero-grid sdc-hero-grid-4">
              <HeroStat label="Unique buyers" value={fmtN(guests.totalBuyers)} />
              <HeroStat label="Total tickets" value={fmtN(guests.totalTickets)} />
              <HeroStat label="Returning guests" value={fmtN(guestData.repeat)} />
              <HeroStat label="Check-in rate" value={`${guestData.checkInRate}%`} accent />
            </div>
            <div className="sdc-grid-2">
              <SdcCard title="Ticket types">
                {Object.keys(guests.ticketTypeBreakdown).length ? Object.entries(guests.ticketTypeBreakdown).map(([type, count]) => (
                  <HBar key={type} label={type} value={count} maxValue={guests.totalTickets || 1} color="#60a5fa" />
                )) : <p className="sdc-empty">No data yet</p>}
              </SdcCard>
              <SdcCard title="Top returners">
                {guestData.topReturners.length ? guestData.topReturners.map((b) => (
                  <div key={b.email} className="sdc-list-row">
                    <div><strong>{b.name}</strong><span>{b.email}</span></div>
                    <span>{b.count} tickets · {b.events.size} events</span>
                  </div>
                )) : <p className="sdc-empty">No repeat buyers yet</p>}
              </SdcCard>
            </div>
            <SdcCard title="All buyers" meta="Recent 50">
              <div className="sdc-table-wrap">
                <table className="sdc-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Event</th><th>Ticket</th><th>Price</th></tr></thead>
                  <tbody>
                    {tickets.slice(0, 50).map((t) => (
                      <tr key={t.id}>
                        <td>{t.buyerName}</td>
                        <td>{t.buyerEmail}</td>
                        <td>{t.eventTitle}</td>
                        <td>{t.ticketType}</td>
                        <td>{t.price === 0 ? 'Free' : fmt$(t.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SdcCard>
          </div>
        )}

        {tab === 'settings' && (
          <div className="sdc-stack">
            <SdcCard className="sdc-profile-hero">
              <div className="sdc-profile-head">
                <DashboardAvatar url={getAvatarUrl(profile, user)} name={orgName} size="lg" />
                <div>
                  <h2>{profile?.providerInfo?.organizationName || profile?.name || orgName}</h2>
                  {profile?.providerInfo?.description && <p>{profile.providerInfo.description}</p>}
                  <div className="sdc-profile-tags">
                    <StatusBadge status={payouts.verificationStatus} />
                    <span className="sdc-tag">{profile?.role}</span>
                  </div>
                </div>
              </div>
            </SdcCard>
            <div className="sdc-grid-2">
              <SdcCard title="Organization">
                <div className="sdc-kv"><span>Organization</span><strong>{profile?.providerInfo?.organizationName || '—'}</strong></div>
                <div className="sdc-kv"><span>Contact email</span><strong>{profile?.providerInfo?.partyEmail || profile?.email || '—'}</strong></div>
                <div className="sdc-kv"><span>Phone</span><strong>{profile?.providerInfo?.partyPhone || profile?.phoneNumber || '—'}</strong></div>
                <div className="sdc-kv"><span>Website</span><strong>{profile?.providerInfo?.website || '—'}</strong></div>
                <div className="sdc-kv"><span>Business address</span><strong>{formatAddress(profile?.providerInfo?.businessAddress) || '—'}</strong></div>
              </SdcCard>
              <SdcCard title="Personal">
                <div className="sdc-kv"><span>Name</span><strong>{profile?.name || '—'}</strong></div>
                <div className="sdc-kv"><span>Account email</span><strong>{profile?.email || '—'}</strong></div>
                <div className="sdc-kv"><span>Phone</span><strong>{profile?.phoneNumber || '—'}</strong></div>
                <div className="sdc-kv"><span>Date of birth</span><strong>{profile?.dateOfBirth || '—'}</strong></div>
                <div className="sdc-kv"><span>Address</span><strong>{formatAddress(profile?.address) || '—'}</strong></div>
              </SdcCard>
              <SdcCard title="Verification">
                <div className="sdc-kv"><span>Status</span><StatusBadge status={payouts.verificationStatus} /></div>
                <div className="sdc-kv"><span>Stripe</span><strong>{payouts.stripeConnected ? 'Connected' : 'Not connected'}</strong></div>
                <div className="sdc-kv"><span>Tax info</span><strong>{profile?.providerInfo?.taxInfo ? 'On file' : 'Not submitted'}</strong></div>
                <div className="sdc-kv"><span>Bank account</span><strong>{profile?.providerInfo?.bankAccountInfo ? 'On file' : 'Not submitted'}</strong></div>
                <div className="sdc-kv"><span>ID verification</span><strong>{profile?.providerInfo?.identityVerification ? 'Submitted' : 'Not submitted'}</strong></div>
              </SdcCard>
              <SdcCard title="Account">
                <div className="sdc-kv"><span>User ID</span><strong className="mono">{profile?.id}</strong></div>
                <div className="sdc-kv"><span>Role</span><strong>{profile?.role}</strong></div>
                <div className="sdc-kv"><span>Member since</span><strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</strong></div>
                <div className="sdc-kv"><span>Last updated</span><strong>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : '—'}</strong></div>
              </SdcCard>
            </div>
          </div>
        )}
      </DashboardLayout>
    </div>
  );
}
