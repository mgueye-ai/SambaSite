'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../lib/auth';
import { apiFetch } from '../lib/api-client';
import { setImpersonation } from '../lib/impersonation';
import DashboardLayout from './dashboard/DashboardLayout';
import {
  AreaChart, fmt$, fmtN, HBar, HeroStat, SdcCard, StatusBadge,
} from './dashboard/ui';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'organizers', label: 'Organizers', icon: '▤' },
  { id: 'events', label: 'Events', icon: '◫' },
  { id: 'platform', label: 'Platform', icon: '◧' },
];

export default function AdminView() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('overview');
  const [eventFilter, setEventFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getCurrentUser();
      if (!u || u.role !== 'admin') {
        router.replace('/login');
        return;
      }
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

  const handleImpersonate = (org) => {
    setImpersonation(org);
    router.push('/dashboard');
  };

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
    if (eventFilter === 'live') return data.events.filter((e) => e.status === 'live');
    if (eventFilter === 'upcoming') return data.events.filter((e) => e.status === 'upcoming');
    if (eventFilter === 'past') return data.events.filter((e) => e.status === 'completed');
    return data.events;
  }, [data, eventFilter]);

  const revenueByDay = useMemo(() => ({
    data: data?.revenueTrend?.map((d) => d.revenue) || [],
    labels: data?.revenueTrend?.map((d) => d.date) || [],
  }), [data]);

  if (loading) return <div className="sdc-loading">Loading admin panel...</div>;
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
          <button type="button" className="sdc-withdraw-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const topOrgs = [...data.organizers].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 8);
  const maxOrgRev = Math.max(...topOrgs.map((o) => o.revenue || 0), 1);

  return (
    <div className="sdc-page">
      <DashboardLayout
        variant="admin"
        title={TABS.find((t) => t.id === tab)?.label || 'Overview'}
        subtitle="Samba Team"
        tabs={TABS.map((t) => ({
          ...t,
          count: t.id === 'organizers' ? data.organizers.length : t.id === 'events' ? data.events.length : null,
        }))}
        activeTab={tab}
        onTabChange={setTab}
        avatarUrl={user?.profilePicture || user?.avatar}
        avatarName={user?.name || 'Samba Admin'}
        email={user?.email}
        headerStats={[
          { label: 'Organizers', value: fmtN(data.stats.totalOrganizers) },
          { label: 'Events', value: fmtN(data.stats.totalEvents) },
          { label: 'Revenue', value: fmt$(data.stats.grossRevenue) },
        ]}
        onSignOut={async () => { await logout(); router.push('/login'); }}
      >
        {tab === 'overview' && (
          <div className="sdc-stack">
            <div className="sdc-hero-grid sdc-hero-grid-6">
              <HeroStat label="Organizers" value={fmtN(data.stats.totalOrganizers)} />
              <HeroStat label="Events" value={fmtN(data.stats.totalEvents)} />
              <HeroStat label="Tickets sold" value={fmtN(data.stats.totalTickets)} />
              <HeroStat label="Gross revenue" value={fmt$(data.stats.grossRevenue)} accent />
              <HeroStat label="Platform fees" value={fmt$(data.stats.platformFees)} />
              <HeroStat label="Live now" value={fmtN(data.stats.liveEvents)} />
            </div>

            <div className="sdc-grid-2">
              <SdcCard title="Platform revenue" meta="Last 30 days" wide>
                <AreaChart data={revenueByDay.data} labels={revenueByDay.labels} color="#888888" />
              </SdcCard>
              <SdcCard title="Platform snapshot">
                <div className="sdc-kv"><span>Attendees</span><strong>{fmtN(data.attendees)}</strong></div>
                <div className="sdc-kv"><span>Admin accounts</span><strong>{fmtN(data.admins)}</strong></div>
                <div className="sdc-kv"><span>Upcoming events</span><strong>{fmtN(data.stats.upcomingEvents)}</strong></div>
                <div className="sdc-kv"><span>Live events</span><strong>{fmtN(data.stats.liveEvents)}</strong></div>
                <div className="sdc-kv total"><span>Net to organizers</span><strong>{fmt$(data.stats.grossRevenue - data.stats.platformFees)}</strong></div>
              </SdcCard>
            </div>

            <div className="sdc-grid-2">
              <SdcCard title="Top organizers" meta="By revenue">
                {topOrgs.map((org) => (
                  <HBar key={org.id} label={org.organizationName} value={org.revenue || 0} maxValue={maxOrgRev} color="#666666" display={fmt$(org.revenue || 0)} />
                ))}
              </SdcCard>
              <SdcCard title="Recent events" meta="Latest 8">
                {data.events.slice(0, 8).map((e) => {
                  const org = data.organizers.find((o) => o.id === e.organizerId);
                  return (
                    <div key={e.id} className="sdc-list-row">
                      <div>
                        <strong>{e.title}</strong>
                        <span>{org?.organizationName || 'Unknown'} · {e.dateLabel}</span>
                      </div>
                      <span>{fmt$(e.revenue || 0)}</span>
                    </div>
                  );
                })}
              </SdcCard>
            </div>
          </div>
        )}

        {tab === 'organizers' && (
          <SdcCard title="All organizers" meta={`${filteredOrgs.length} shown`}>
            <input
              type="search"
              className="sdc-search"
              placeholder="Search organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="sdc-table-wrap">
              <table className="sdc-table">
                <thead>
                  <tr><th>Organization</th><th>Email</th><th>Events</th><th>Tickets</th><th>Revenue</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredOrgs.length ? filteredOrgs.map((org) => (
                    <tr key={org.id}>
                      <td>
                        <strong>{org.organizationName}</strong>
                        <span className="sdc-sub">{org.name}</span>
                      </td>
                      <td>{org.email}</td>
                      <td>{org.eventCount}</td>
                      <td>{org.ticketCount}</td>
                      <td>{fmt$(org.revenue)}</td>
                      <td><StatusBadge status={org.verificationStatus === 'verified' ? 'verified' : 'upcoming'} /></td>
                      <td>
                        <button type="button" className="sdc-action-btn" onClick={() => handleImpersonate(org)}>
                          Manage as organizer
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="sdc-empty">No organizers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="sdc-hint">Manage as organizer opens their full control center with events, payouts, tickets, and settings.</p>
          </SdcCard>
        )}

        {tab === 'events' && (
          <div className="sdc-stack">
            <div className="sdc-filter-pills">
              {['all', 'upcoming', 'live', 'past'].map((f) => (
                <button key={f} type="button" className={`sdc-filter${eventFilter === f ? ' active' : ''}`} onClick={() => setEventFilter(f)}>
                  {f === 'past' ? 'Past' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <SdcCard title="Platform events" meta={`${filteredEvents.length} events`}>
              <div className="sdc-table-wrap">
                <table className="sdc-table">
                  <thead>
                    <tr><th>Status</th><th>Event</th><th>Organizer</th><th>Date</th><th>Tickets</th><th>Revenue</th><th>Link</th></tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((e) => {
                      const org = data.organizers.find((o) => o.id === e.organizerId);
                      return (
                        <tr key={e.id}>
                          <td><StatusBadge status={e.status} /></td>
                          <td><strong>{e.title}</strong></td>
                          <td>{org?.organizationName || e.organizerId?.slice(0, 8)}</td>
                          <td>{e.dateLabel}</td>
                          <td>{e.bookedSpots}</td>
                          <td>{fmt$(e.revenue || 0)}</td>
                          <td><Link href={`/events/${e.id}`} className="sdc-link-btn">View</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SdcCard>
          </div>
        )}

        {tab === 'platform' && (
          <div className="sdc-grid-2">
            <SdcCard title="Revenue & fees">
              <div className="sdc-kv"><span>Gross ticket revenue</span><strong>{fmt$(data.stats.grossRevenue)}</strong></div>
              <div className="sdc-kv"><span>Platform fees (10%)</span><strong>{fmt$(data.stats.platformFees)}</strong></div>
              <div className="sdc-kv total"><span>Organizer earnings</span><strong>{fmt$(data.stats.grossRevenue - data.stats.platformFees)}</strong></div>
            </SdcCard>
            <SdcCard title="User base">
              <div className="sdc-kv"><span>Organizers</span><strong>{fmtN(data.stats.totalOrganizers)}</strong></div>
              <div className="sdc-kv"><span>Attendees</span><strong>{fmtN(data.attendees)}</strong></div>
              <div className="sdc-kv"><span>Admin accounts</span><strong>{fmtN(data.admins)}</strong></div>
            </SdcCard>
            <SdcCard title="Event health">
              <div className="sdc-kv"><span>Total events</span><strong>{fmtN(data.stats.totalEvents)}</strong></div>
              <div className="sdc-kv"><span>Upcoming</span><strong>{fmtN(data.stats.upcomingEvents)}</strong></div>
              <div className="sdc-kv"><span>Live</span><strong>{fmtN(data.stats.liveEvents)}</strong></div>
              <div className="sdc-kv"><span>Tickets sold</span><strong>{fmtN(data.stats.totalTickets)}</strong></div>
            </SdcCard>
            <SdcCard title="Leaderboard" meta="Top organizers">
              {data.organizers.slice(0, 10).map((org) => (
                <div key={org.id} className="sdc-kv">
                  <span>{org.organizationName}</span>
                  <strong>{fmt$(org.revenue)}</strong>
                </div>
              ))}
            </SdcCard>
          </div>
        )}
      </DashboardLayout>
    </div>
  );
}
