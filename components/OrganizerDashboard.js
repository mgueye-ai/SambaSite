'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../lib/auth';
import { apiFetch } from '../lib/api-client';
import { getImpersonation, clearImpersonation } from '../lib/impersonation';
import { computeDashboardStats } from '../lib/events';
import DashboardLayout from './dashboard/DashboardLayout';
import CreateEventForm, { CreateEventSuccess } from './CreateEventForm';
import SettingsPanel from './SettingsPanel';
import { getEventManagePath } from '../lib/event-manage';
import {
  AnalyticsBand, AppEventRow, AreaChart, DashboardAvatar, DonutChart, EventCard, FloatStat, fmt$, fmtN,
  HBar, HeroStat, PeriodPills, SectionLabel, Sparkline, SdcCard, StatusBadge,
} from './dashboard/ui';

const PERIODS = ['day', 'week', 'month', 'year', 'all'];
const TABS = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'create', label: 'Create', icon: '＋' },
  { id: 'events', label: 'Events', icon: '▤' },
  { id: 'payouts', label: 'Payouts', icon: '◧' },
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
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [tab, setTab] = useState('overview');
  const [eventFilter, setEventFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [createdEvent, setCreatedEvent] = useState(null);
  const impersonation = typeof window !== 'undefined' ? getImpersonation() : null;
  const activeOrganizerId = impersonation?.organizerId || user?.id;

  const loadData = useCallback(async (organizerId) => {
    const q = organizerId ? `?organizerId=${organizerId}` : '';
    return apiFetch(`/api/dashboard${q}`);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

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
    if (eventFilter === 'past') return events.filter((e) => e.status === 'completed' || e.status === 'past');
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
          count: t.id === 'events' ? events.length : null,
        }))}
        activeTab={tab}
        onTabChange={setTab}
        avatarUrl={getAvatarUrl(profile, user)}
        avatarName={orgName}
        email={impersonation?.organizerEmail || profile?.email || user?.email}
        balance={fmt$(payouts.balance)}
        processing={fmt$(Math.max(0, payouts.netEarnings - payouts.balance - payouts.paidOut))}
        impersonation={impersonation}
        onExitImpersonation={() => { clearImpersonation(); router.push('/admin'); }}
        adminLink={user?.role === 'admin' ? <Link href="/admin" className="sdc-sidebar-link">Admin panel</Link> : null}
        onSignOut={async () => { await logout(); router.push('/login'); }}
        toast={actionMsg}
        contentClassName={['overview', 'payouts'].includes(tab) ? 'sdc-content--analytics' : tab === 'create' ? 'sdc-content--create' : tab === 'events' ? 'sdc-content--events' : tab === 'settings' ? 'sdc-content--analytics sdc-content--settings' : ''}
      >
        {tab === 'overview' && (
          <div className="sdc-analytics">
            <section className="sdc-analytics-hero">
              <div className="sdc-analytics-hero-top">
                <PeriodPills periods={PERIODS} active={period} onChange={setPeriod} />
                <div className="sdc-analytics-hero-row">
                  <div className="sdc-analytics-hero-main">
                    <span className="sdc-analytics-kicker">Revenue signal</span>
                    <p className="sdc-analytics-amount">{fmt$(stats.revenuePeriod)}</p>
                    <p className="sdc-analytics-caption">
                      {period === 'all' ? 'Total revenue' : `Revenue · This ${period}`}
                    </p>
                    <div className="sdc-analytics-stats">
                      <FloatStat label="Events" value={fmtN(events.length)} />
                      <FloatStat label="Tickets sold" value={fmtN(stats.totalTickets)} />
                      <FloatStat label="Fill rate" value={`${stats.fillRate}%`} />
                      <FloatStat label="Net earnings" value={fmt$(payouts.netEarnings)} accent />
                    </div>
                  </div>
                  <div className="sdc-analytics-spark">
                    <Sparkline
                      data={trendRev.length > 1 ? trendRev : [0, stats.revenuePeriod * 0.4, stats.revenuePeriod]}
                      width={280}
                      height={64}
                    />
                  </div>
                </div>
              </div>
            </section>

            {stats.live.length > 0 && (
              <div className="sdc-analytics-live">
                <span className="sdc-live-dot" />
                <span>{stats.live.length} event{stats.live.length > 1 ? 's' : ''} live right now</span>
                <button type="button" onClick={() => { setTab('events'); setEventFilter('live'); }}>View live</button>
              </div>
            )}

            <div className="sdc-analytics-charts">
              <AnalyticsBand title="Revenue trend" meta="Last 30 days">
                <AreaChart data={trendRev} labels={trendLabels} height={130} />
              </AnalyticsBand>
              <AnalyticsBand title="Ticket velocity" meta="Last 30 days">
                <AreaChart
                  data={trends.revenue30d?.map((d) => d.tickets) || []}
                  labels={trendLabels}
                  color="#4ade80"
                  formatY={fmtN}
                  height={130}
                />
              </AnalyticsBand>
            </div>

            <div className="sdc-analytics-grid sdc-analytics-grid-3">
              <AnalyticsBand title="Event breakdown" meta="Status mix">
                <DonutChart segments={[
                  { label: 'Live', value: stats.live.length, color: '#4ade80' },
                  { label: 'Upcoming', value: stats.upcoming.length, color: '#FF4B8C' },
                  { label: 'Past', value: stats.past.length, color: 'rgba(255,255,255,0.2)' },
                ]} />
              </AnalyticsBand>
              <AnalyticsBand title="Top events" meta="Tickets">
                {topTickets.length ? topTickets.map((e) => (
                  <HBar key={e.id} label={e.title} value={e.bookedSpots || 0} maxValue={maxT} />
                )) : <p className="sdc-empty">No events yet</p>}
              </AnalyticsBand>
              <AnalyticsBand title="Top events" meta="Revenue">
                {topRev.length ? topRev.map((e) => (
                  <HBar key={e.id} label={e.title} value={e.revenue || 0} maxValue={maxR} color="#FF4B8C" display={fmt$(e.revenue || 0)} />
                )) : <p className="sdc-empty">No events yet</p>}
              </AnalyticsBand>
            </div>

            <div className="sdc-analytics-grid sdc-analytics-grid-2">
              <AnalyticsBand title="Guest pulse" meta="Audience">
                <div className="sdc-analytics-stats sdc-analytics-stats--inline">
                  <FloatStat label="Unique buyers" value={fmtN(guests.totalBuyers)} />
                  <FloatStat label="Returning" value={fmtN(guestData.repeat)} />
                  <FloatStat label="Check-in rate" value={`${guestData.checkInRate}%`} accent />
                  <FloatStat label="Avg / event" value={events.length ? fmtN(Math.round(guests.totalTickets / events.length)) : '0'} />
                </div>
              </AnalyticsBand>
              <AnalyticsBand title="Recent sales" meta={`${tickets.length} total`}>
                {tickets.slice(0, 6).map((t) => (
                  <div key={t.id} className="sdc-list-row sdc-list-row--bare">
                    <div>
                      <strong>{t.buyerName}</strong>
                      <span>{t.eventTitle} · {t.ticketType}</span>
                    </div>
                    <span className="sdc-list-row-val">{t.price === 0 ? 'Free' : fmt$(t.price)}</span>
                  </div>
                ))}
                {!tickets.length && <p className="sdc-empty">No ticket sales yet</p>}
              </AnalyticsBand>
            </div>
          </div>
        )}

        {tab === 'create' && (
          createdEvent ? (
            <CreateEventSuccess
              event={createdEvent}
              onDone={async () => {
                setCreatedEvent(null);
                setTab('events');
                await refresh();
              }}
            />
          ) : (
            <CreateEventForm
              profile={profile}
              user={user}
              organizerId={activeOrganizerId}
              onSuccess={(event) => {
                setCreatedEvent(event);
                setActionMsg('Event created');
              }}
              onCancel={() => setTab('events')}
            />
          )
        )}

        {tab === 'events' && (
          <div className="sdc-events-screen">
            <div className="sdc-events-topbar">
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
              <span className="sdc-events-count">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
            </div>

            {events.length === 0 ? (
              <div className="sdc-empty-card">
                <h3>No events yet</h3>
                <p>Create your first event in the Create tab or in the Samba app — both stay in sync.</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <p className="sdc-empty">No events in this category</p>
            ) : (
              <div className="sdc-app-event-list">
                {filteredEvents.map((e) => (
                  <AppEventRow
                    key={e.id}
                    event={e}
                    onToggleSales={() => updateEvent(e.id, { ticket_sales_open: !e.ticketSalesOpen })}
                    onToggleExplore={() => updateEvent(e.id, { show_on_explore: !e.showOnExplore })}
                    onStatusChange={(status) => updateEvent(e.id, { status })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payouts' && (
          <div className="sdc-stack">
            {/* Hero */}
            <section className="sdc-analytics-hero-wrap">
              <div className="sdc-analytics-hero">
                <div className="sdc-analytics-hero-main">
                  <span className="sdc-analytics-kicker">Available balance</span>
                  <p className="sdc-analytics-amount">{fmt$(payouts.balance)}</p>
                  <p className="sdc-analytics-caption">Net earnings after Samba fees</p>
                  <div className="sdc-analytics-stats">
                    <FloatStat label="Gross revenue" value={fmt$(payouts.grossRevenue)} />
                    <FloatStat label="Net earnings" value={fmt$(payouts.netEarnings)} />
                    <FloatStat label="Paid out" value={fmt$(payouts.paidOut)} accent />
                  </div>
                  <button
                    type="button"
                    className="sdc-payout-withdraw-btn"
                    disabled={payouts.balance <= 0}
                  >
                    Withdraw {fmt$(payouts.balance)}
                  </button>
                </div>
              </div>
            </section>

            <div className="sdc-analytics-grid sdc-analytics-grid-2">
              {/* Earnings breakdown — no platform fee row */}
              <AnalyticsBand title="Earnings breakdown">
                <div className="sdc-payout-kv-list">
                  <div className="sdc-payout-kv"><span>Gross revenue</span><strong>{fmt$(payouts.grossRevenue)}</strong></div>
                  <div className="sdc-payout-kv"><span>Net earnings</span><strong>{fmt$(payouts.netEarnings)}</strong></div>
                  <div className="sdc-payout-kv"><span>Paid out</span><strong>{fmt$(payouts.paidOut)}</strong></div>
                  <div className="sdc-payout-kv sdc-payout-kv--total"><span>Balance</span><strong>{fmt$(payouts.balance)}</strong></div>
                </div>
              </AnalyticsBand>

              {/* Connected account */}
              <AnalyticsBand title="Connected account">
                <div className="sdc-connected-account">
                  <div className="sdc-connected-bank">
                    <div className="sdc-connected-bank-icon">🏦</div>
                    <div className="sdc-connected-bank-info">
                      <strong>Chase Bank</strong>
                      <span>Checking •••• 4821</span>
                    </div>
                    <span className="sdc-connected-badge">Active</span>
                  </div>
                  <div className="sdc-payout-kv-list" style={{ marginTop: 16 }}>
                    <div className="sdc-payout-kv">
                      <span>Verification</span>
                      <StatusBadge status={payouts.verificationStatus} />
                    </div>
                    <div className="sdc-payout-kv">
                      <span>Stripe Connect</span>
                      <strong>{payouts.stripeConnected ? '✓ Connected' : 'Not connected'}</strong>
                    </div>
                    <div className="sdc-payout-kv">
                      <span>Payout speed</span>
                      <strong>2 business days</strong>
                    </div>
                  </div>
                </div>
                <p className="sdc-payout-hint">Manage your bank account in the Samba app.</p>
              </AnalyticsBand>
            </div>

            {/* Per-event earnings */}
            {events.length > 0 && (
              <AnalyticsBand title="Revenue by event" meta={`${events.length} events`}>
                {[...events]
                  .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                  .map((e) => (
                    <HBar
                      key={e.id}
                      label={e.title}
                      value={e.revenue || 0}
                      maxValue={Math.max(...events.map((ev) => ev.revenue || 0), 1)}
                      color="#FF4B8C"
                      display={fmt$(e.revenue || 0)}
                    />
                  ))}
              </AnalyticsBand>
            )}

            {/* Recent ticket sales */}
            <AnalyticsBand title="Recent sales" meta={`${tickets.length} total`}>
              {tickets.slice(0, 8).map((t) => (
                <div key={t.id} className="sdc-list-row sdc-list-row--bare">
                  <div>
                    <strong>{t.buyerName}</strong>
                    <span>{t.eventTitle} · {t.ticketType}</span>
                  </div>
                  <span className="sdc-list-row-val">{t.price === 0 ? 'Free' : fmt$(t.price)}</span>
                </div>
              ))}
              {!tickets.length && <p className="sdc-empty">No ticket sales yet</p>}
            </AnalyticsBand>
          </div>
        )}

        {false && (
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


        {tab === 'settings' && (
          <SettingsPanel
            profile={{ ...profile, avatar: getAvatarUrl(profile, user) }}
            user={user}
            organizerId={activeOrganizerId}
            impersonation={impersonation}
            payouts={payouts}
            onSaved={(text) => {
              setActionMsg(text);
              refresh();
              setTimeout(() => setActionMsg(''), 3000);
            }}
            onError={setActionMsg}
          />
        )}
      </DashboardLayout>
    </div>
  );
}
