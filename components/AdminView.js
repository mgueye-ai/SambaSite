'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../lib/auth';
import { apiFetch } from '../lib/api-client';
import { setImpersonation } from '../lib/impersonation';
import DashboardLayout from './dashboard/DashboardLayout';
import {
  AnalyticsBand, AreaChart, DashboardAvatar, FloatStat, fmt$, fmtN,
  HBar, StatusBadge,
} from './dashboard/ui';

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: '◈' },
  { id: 'organizers', label: 'Organizers',  icon: '▤' },
  { id: 'events',     label: 'Events',      icon: '◫' },
  { id: 'platform',   label: 'Platform',    icon: '◧' },
];

const EVENT_FILTERS = ['all', 'upcoming', 'live', 'past'];

export default function AdminView() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('overview');
  const [eventFilter, setEventFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCurrentUser();
      if (!u || u.role !== 'admin') { router.replace('/login'); return; }
      if (cancelled) return;
      setUser(u);
      try {
        const platform = await apiFetch('/api/admin');
        if (!cancelled) setData(platform);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load platform data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  const handleImpersonate = (org) => { setImpersonation(org); router.push('/dashboard'); };

  const filteredOrgs = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.organizers.filter((o) =>
      o.organizationName?.toLowerCase().includes(q)
      || o.email?.toLowerCase().includes(q)
      || o.name?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    if (eventFilter === 'live')     return data.events.filter((e) => e.status === 'live');
    if (eventFilter === 'upcoming') return data.events.filter((e) => e.status === 'upcoming');
    if (eventFilter === 'past')     return data.events.filter((e) => e.status === 'completed');
    return data.events;
  }, [data, eventFilter]);

  const revenueByDay = useMemo(() => ({
    data:   data?.revenueTrend?.map((d) => d.revenue) || [],
    labels: data?.revenueTrend?.map((d) => d.date) || [],
  }), [data]);

  const topOrgs = useMemo(() => {
    if (!data) return [];
    return [...data.organizers].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 8);
  }, [data]);

  const maxOrgRev = Math.max(...(topOrgs.map((o) => o.revenue || 0)), 1);

  const contentClass = (t) => {
    if (['overview', 'platform'].includes(t)) return 'sdc-content--analytics';
    if (t === 'organizers' || t === 'events') return 'sdc-content--events';
    return '';
  };

  if (loading) return <div className="sdc-loading">Loading admin panel…</div>;
  if (error) {
    return (
      <div className="sdc-page">
        <div className="sdc-loading sdc-error">
          <p>{error}</p>
          <p className="sdc-hint">
            {error === 'Admin access required'
              ? 'Add SUPABASE_SERVICE_ROLE_KEY in Vercel env vars and redeploy.'
              : 'Ensure SUPABASE_SERVICE_ROLE_KEY is set and supabase/admin.sql has been run.'}
          </p>
          <button type="button" className="sdc-payout-withdraw-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { stats } = data;

  return (
    <div className="sdc-page">
      <DashboardLayout
        variant="admin"
        title={TABS.find((t) => t.id === tab)?.label || 'Overview'}
        subtitle="Samba Team"
        tabs={TABS.map((t) => ({
          ...t,
          count: t.id === 'organizers' ? data.organizers.length
               : t.id === 'events'     ? data.events.length
               : null,
        }))}
        activeTab={tab}
        onTabChange={setTab}
        avatarUrl={user?.profilePicture || user?.avatar}
        avatarName={user?.name || 'Samba Admin'}
        email={user?.email}
        contentClassName={contentClass(tab)}
        onSignOut={async () => { await logout(); router.push('/login'); }}
      >

        {/* ══════════════ OVERVIEW ══════════════ */}
        {tab === 'overview' && (
          <div className="sdc-stack">
            <section className="sdc-analytics-hero-wrap">
              <div className="sdc-analytics-hero">
                <div className="sdc-analytics-hero-main">
                  <span className="sdc-analytics-kicker">Platform revenue</span>
                  <p className="sdc-analytics-amount">{fmt$(stats.grossRevenue)}</p>
                  <p className="sdc-analytics-caption">Total gross across all organizers</p>
                  <div className="sdc-analytics-stats">
                    <FloatStat label="Organizers"   value={fmtN(stats.totalOrganizers)} />
                    <FloatStat label="Events"        value={fmtN(stats.totalEvents)} />
                    <FloatStat label="Tickets sold"  value={fmtN(stats.totalTickets)} />
                    <FloatStat label="Platform fees" value={fmt$(stats.platformFees)} accent />
                  </div>
                </div>
              </div>
            </section>

            {stats.liveEvents > 0 && (
              <div className="sdc-analytics-live">
                <span className="sdc-live-dot" />
                <span>{stats.liveEvents} event{stats.liveEvents > 1 ? 's' : ''} live right now</span>
                <button type="button" onClick={() => { setTab('events'); setEventFilter('live'); }}>
                  View live
                </button>
              </div>
            )}

            <div className="sdc-analytics-charts">
              <AnalyticsBand title="Revenue trend" meta="Last 30 days">
                <AreaChart data={revenueByDay.data} labels={revenueByDay.labels} color="#f5b642" height={130} />
              </AnalyticsBand>
              <AnalyticsBand title="Platform snapshot">
                <div className="sdc-payout-kv-list">
                  <div className="sdc-payout-kv"><span>Gross revenue</span><strong>{fmt$(stats.grossRevenue)}</strong></div>
                  <div className="sdc-payout-kv"><span>Platform fees (10%)</span><strong>{fmt$(stats.platformFees)}</strong></div>
                  <div className="sdc-payout-kv"><span>Upcoming events</span><strong>{fmtN(stats.upcomingEvents)}</strong></div>
                  <div className="sdc-payout-kv"><span>Live events</span><strong>{fmtN(stats.liveEvents)}</strong></div>
                  <div className="sdc-payout-kv"><span>Attendees</span><strong>{fmtN(data.attendees)}</strong></div>
                  <div className="sdc-payout-kv sdc-payout-kv--total"><span>Net to organizers</span><strong>{fmt$(stats.grossRevenue - stats.platformFees)}</strong></div>
                </div>
              </AnalyticsBand>
            </div>

            <div className="sdc-analytics-grid sdc-analytics-grid-2">
              <AnalyticsBand title="Top organizers" meta="By revenue">
                {topOrgs.length ? topOrgs.map((org) => (
                  <HBar
                    key={org.id}
                    label={org.organizationName || org.name}
                    value={org.revenue || 0}
                    maxValue={maxOrgRev}
                    color="#f5b642"
                    display={fmt$(org.revenue || 0)}
                  />
                )) : <p className="sdc-empty">No organizers yet</p>}
              </AnalyticsBand>

              <AnalyticsBand title="Recent events" meta="Latest 8">
                {data.events.slice(0, 8).map((e) => {
                  const org = data.organizers.find((o) => o.id === e.organizerId);
                  return (
                    <div key={e.id} className="sdc-list-row sdc-list-row--bare">
                      <div>
                        <strong>{e.title}</strong>
                        <span>{org?.organizationName || 'Unknown'} · {e.dateLabel}</span>
                      </div>
                      <span className="sdc-list-row-val">{fmt$(e.revenue || 0)}</span>
                    </div>
                  );
                })}
                {!data.events.length && <p className="sdc-empty">No events yet</p>}
              </AnalyticsBand>
            </div>
          </div>
        )}

        {/* ══════════════ ORGANIZERS ══════════════ */}
        {tab === 'organizers' && (
          <div className="sdc-stack">
            <div className="sdc-events-topbar">
              <input
                type="search"
                className="sdc-search"
                placeholder="Search organizers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="sdc-events-count">{filteredOrgs.length} organizer{filteredOrgs.length !== 1 ? 's' : ''}</span>
            </div>

            {filteredOrgs.length === 0 ? (
              <p className="sdc-empty">No organizers found</p>
            ) : (
              <div className="sdc-app-event-list">
                {filteredOrgs.map((org) => (
                  <div key={org.id} className="sdc-admin-org-row">
                    <div className="sdc-admin-org-avatar">
                      <DashboardAvatar url={org.avatar || org.partyLogo} name={org.organizationName || org.name} size="sm" />
                    </div>
                    <div className="sdc-admin-org-body">
                      <p className="sdc-admin-org-name">{org.organizationName || org.name}</p>
                      <p className="sdc-admin-org-meta">{org.email}</p>
                    </div>
                    <div className="sdc-admin-org-stats">
                      <div className="sdc-admin-org-stat">
                        <span>{fmtN(org.eventCount || 0)}</span>
                        <label>Events</label>
                      </div>
                      <div className="sdc-admin-org-stat">
                        <span>{fmtN(org.ticketCount || 0)}</span>
                        <label>Tickets</label>
                      </div>
                      <div className="sdc-admin-org-stat accent">
                        <span>{fmt$(org.revenue || 0)}</span>
                        <label>Revenue</label>
                      </div>
                    </div>
                    <div className="sdc-admin-org-actions">
                      <StatusBadge status={org.verificationStatus === 'verified' ? 'verified' : 'upcoming'} />
                      <button
                        type="button"
                        className="sdc-app-event-manage"
                        onClick={() => handleImpersonate(org)}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ EVENTS ══════════════ */}
        {tab === 'events' && (
          <div className="sdc-events-screen">
            <div className="sdc-events-topbar">
              <div className="sdc-filter-pills">
                {EVENT_FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`sdc-filter${eventFilter === f ? ' active' : ''}`}
                    onClick={() => setEventFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'live' && data.stats.liveEvents > 0 && <span className="sdc-filter-dot" />}
                  </button>
                ))}
              </div>
              <span className="sdc-events-count">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
            </div>

            {filteredEvents.length === 0 ? (
              <p className="sdc-empty">No events in this category</p>
            ) : (
              <div className="sdc-app-event-list">
                {filteredEvents.map((e) => {
                  const org = data.organizers.find((o) => o.id === e.organizerId);
                  const soldPct = e.totalSpots > 0 ? Math.min(100, Math.round((e.bookedSpots / e.totalSpots) * 100)) : 0;
                  return (
                    <article key={e.id} className={`sdc-app-event-row sdc-event-${e.status}`}>
                      <Link href={`/events/${e.id}`} className="sdc-app-event-cover">
                        {e.coverImage
                          ? <img src={e.coverImage} alt="" />
                          : <span className="sdc-app-event-cover-ph">{e.title?.[0]}</span>}
                      </Link>
                      <div className="sdc-app-event-body">
                        <div className="sdc-app-event-top">
                          <div className="sdc-app-event-info">
                            <StatusBadge status={e.status} />
                            <h3 className="sdc-app-event-title">{e.title}</h3>
                            <p className="sdc-app-event-meta">
                              {org?.organizationName || 'Unknown'} · {e.dateLabel}{e.venue ? ` · ${e.venue}` : ''}
                            </p>
                          </div>
                          <div className="sdc-app-event-nums">
                            <div className="sdc-app-stat">
                              <strong>{e.bookedSpots || 0}</strong>
                              <span>sold{e.totalSpots ? ` / ${e.totalSpots}` : ''}</span>
                            </div>
                            <div className="sdc-app-stat">
                              <strong>{fmt$(e.revenue || 0)}</strong>
                              <span>revenue</span>
                            </div>
                          </div>
                        </div>
                        {e.totalSpots > 0 && (
                          <div className="sdc-app-event-bar">
                            <div className="sdc-app-event-bar-fill" style={{ width: `${soldPct}%` }} />
                          </div>
                        )}
                        <div className="sdc-app-event-actions">
                          <Link href={`/events/${e.id}`} className="sdc-link-btn">View</Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ PLATFORM ══════════════ */}
        {tab === 'platform' && (
          <div className="sdc-stack">
            <section className="sdc-analytics-hero-wrap">
              <div className="sdc-analytics-hero">
                <div className="sdc-analytics-hero-main">
                  <span className="sdc-analytics-kicker">Platform fees collected</span>
                  <p className="sdc-analytics-amount">{fmt$(stats.platformFees)}</p>
                  <p className="sdc-analytics-caption">10% of all gross ticket revenue</p>
                  <div className="sdc-analytics-stats">
                    <FloatStat label="Gross revenue"  value={fmt$(stats.grossRevenue)} />
                    <FloatStat label="To organizers"  value={fmt$(stats.grossRevenue - stats.platformFees)} />
                    <FloatStat label="Total tickets"  value={fmtN(stats.totalTickets)} />
                    <FloatStat label="Attendees"      value={fmtN(data.attendees)} accent />
                  </div>
                </div>
              </div>
            </section>

            <div className="sdc-analytics-grid sdc-analytics-grid-2">
              <AnalyticsBand title="User base">
                <div className="sdc-payout-kv-list">
                  <div className="sdc-payout-kv"><span>Organizers</span><strong>{fmtN(stats.totalOrganizers)}</strong></div>
                  <div className="sdc-payout-kv"><span>Attendees</span><strong>{fmtN(data.attendees)}</strong></div>
                  <div className="sdc-payout-kv"><span>Admin accounts</span><strong>{fmtN(data.admins)}</strong></div>
                </div>
              </AnalyticsBand>

              <AnalyticsBand title="Event health">
                <div className="sdc-payout-kv-list">
                  <div className="sdc-payout-kv"><span>Total events</span><strong>{fmtN(stats.totalEvents)}</strong></div>
                  <div className="sdc-payout-kv"><span>Upcoming</span><strong>{fmtN(stats.upcomingEvents)}</strong></div>
                  <div className="sdc-payout-kv"><span>Live now</span><strong>{fmtN(stats.liveEvents)}</strong></div>
                  <div className="sdc-payout-kv sdc-payout-kv--total"><span>Tickets sold</span><strong>{fmtN(stats.totalTickets)}</strong></div>
                </div>
              </AnalyticsBand>
            </div>

            <AnalyticsBand title="Organizer leaderboard" meta="By revenue">
              {data.organizers
                .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
                .map((org) => (
                  <HBar
                    key={org.id}
                    label={org.organizationName || org.name}
                    value={org.revenue || 0}
                    maxValue={maxOrgRev}
                    color="#f5b642"
                    display={`${fmt$(org.revenue || 0)} · ${fmtN(org.eventCount || 0)} events`}
                  />
                ))}
              {!data.organizers.length && <p className="sdc-empty">No organizers yet</p>}
            </AnalyticsBand>
          </div>
        )}

      </DashboardLayout>
    </div>
  );
}
