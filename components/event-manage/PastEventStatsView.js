'use client';

import {
  AnalyticsBand, AreaChart, BarChart, FloatStat, fmt$, fmtN, HBar, SectionLabel, SdcCard,
} from '../dashboard/ui';
import { computeEventMetrics } from '../../lib/event-manage';
import EventGuestsList from './EventGuestsList';
import EventManageLayout from './EventManageLayout';

export default function PastEventStatsView({ event, tickets, backHref }) {
  const metrics = computeEventMetrics(event, tickets);

  const maxTicket = Math.max(...(metrics.ticketBreakdown.map((t) => t.sold) || [1]), 1);

  return (
    <EventManageLayout event={event} backHref={backHref}>

      {/* Hero numbers — same float-stat style as overview */}
      <div className="evm-analytics-hero">
        <div className="evm-analytics-hero-main">
          <span className="sdc-analytics-kicker">Event revenue</span>
          <p className="sdc-analytics-amount">{fmt$(metrics.revenueAmount)}</p>
          <p className="sdc-analytics-caption">Total from ticket sales</p>
          <div className="sdc-analytics-stats">
            <FloatStat label="Tickets sold" value={fmtN(metrics.ticketsSold)} />
            <FloatStat label="Checked in" value={fmtN(metrics.checkedInCount)} />
            <FloatStat label="Check-in rate" value={`${metrics.checkInPct}%`} accent />
            <FloatStat label="Ticket types" value={fmtN(metrics.ticketBreakdown.length)} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="sdc-analytics-charts">
        <AnalyticsBand title="Check-ins over time">
          <AreaChart data={metrics.checkInSeries} labels={metrics.checkInLabels} color="#888888" formatY={fmtN} height={130} />
        </AnalyticsBand>
        <AnalyticsBand title="Ticket sales">
          <BarChart data={metrics.salesSeries} labels={metrics.salesLabels} color="#666666" height={130} />
        </AnalyticsBand>
      </div>

      {/* Ticket breakdown */}
      {metrics.ticketBreakdown.length > 0 && (
        <AnalyticsBand title="Ticket breakdown" meta={`${metrics.ticketBreakdown.length} types`}>
          {metrics.ticketBreakdown.map((tk) => (
            <HBar
              key={tk.name}
              label={tk.name}
              value={tk.sold}
              maxValue={maxTicket}
              display={`${fmtN(tk.sold)}${tk.total > 0 ? ` / ${fmtN(tk.total)}` : ''}${tk.price > 0 ? ` · $${tk.price}` : ''}`}
            />
          ))}
        </AnalyticsBand>
      )}

      {/* Guest list */}
      <SectionLabel>Guest list</SectionLabel>
      <SdcCard>
        <EventGuestsList tickets={metrics.eventTickets} />
      </SdcCard>

      {/* Recent check-ins */}
      {metrics.recentCheckIns.length > 0 && (
        <>
          <SectionLabel>Recent check-ins</SectionLabel>
          <div className="evm-checkin-list">
            {metrics.recentCheckIns.map((c, i) => (
              <div key={i} className="evm-checkin-row">
                <strong>{c.name}</strong>
                <span>{c.ticketType || 'Ticket'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </EventManageLayout>
  );
}
