import Link from 'next/link';
import LandingIcon from './LandingIcon';

const BENEFITS = [
  {
    icon: 'ticket',
    title: 'Sell tickets online',
    desc: 'Launch paid or free tickets in minutes with secure checkout.',
  },
  {
    icon: 'chart',
    title: 'Track attendees',
    desc: 'Monitor sales, fill rate, and audience growth in real time.',
  },
  {
    icon: 'megaphone',
    title: 'Promote events',
    desc: 'Share branded links and reach fans across every channel.',
  },
  {
    icon: 'scan',
    title: 'Manage check-ins',
    desc: 'Scan tickets at the door and keep entry lines moving fast.',
  },
];

const BARS = [
  22, 28, 35, 43, 58, 30, 52, 45, 60, 72, 66, 48,
  70, 82, 76, 96, 68, 84, 74, 91, 63, 79, 54, 73,
];

const METRICS = [
  { icon: 'ticket', label: 'Tickets Sold', value: '1,284', delta: '↑ 24% vs last month' },
  { icon: 'users', label: 'Checked In', value: '912', delta: '↑ 16% vs last month' },
  { icon: 'chart', label: 'Fill Rate', value: '87%', delta: '↑ 9% vs last month' },
  { icon: 'calendar', label: 'Active Events', value: '12', delta: 'This month' },
];

export default function OrganizerSection() {
  return (
    <section className="lp-section lp-org-section" id="organizers">
      <div className="lp-container">
        <div className="lp-org-shell">
          <div className="lp-org-top">
            <div className="lp-org-copy">
              <span className="lp-org-eyebrow">Built for organizers</span>
              <h2>
                Sell Out Events
                <br />
                Without The <span>Stress</span>
              </h2>
              <p>
                Launch events, sell tickets, manage guests, and track performance from one
                clean dashboard built for African event organizers.
              </p>

              <Link href="/login" className="lp-btn lp-btn-primary lp-btn-lg lp-org-cta">
                List Your Event
                <LandingIcon name="arrow-right" size={16} />
              </Link>

              <div className="lp-org-trust">
                <div className="lp-org-avatars" aria-hidden="true">
                  <span>AM</span>
                  <span>FK</span>
                  <span>TO</span>
                </div>
                <p>Join <strong>2,500+</strong> organizers growing events across Africa</p>
              </div>
            </div>

            <div className="lp-org-visual">
              <div className="lp-org-panel">
                <div className="lp-org-panel-glow" aria-hidden="true" />

                <div className="lp-org-panel-head">
                  <div>
                    <strong className="lp-org-panel-title">Overview</strong>
                    <span className="lp-org-panel-label">This month</span>
                  </div>
                  <span className="lp-org-panel-pill">
                    <span className="lp-org-panel-live" aria-hidden="true" />
                    Live
                  </span>
                </div>

                <div className="lp-org-chart-card">
                  <div className="lp-org-chart-head">
                    <div>
                      <span className="lp-org-chart-label">Total Revenue</span>
                      <div className="lp-org-panel-value-row">
                        <strong className="lp-org-panel-value">₦4.2M</strong>
                        <span className="lp-org-chip">↑ 18% vs last month</span>
                      </div>
                    </div>
                    <span className="lp-org-select">This Month</span>
                  </div>

                  <div className="lp-org-bars" aria-hidden="true">
                    {BARS.map((height, index) => (
                      <span key={index} className="lp-org-bar" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>

                <div className="lp-org-metrics">
                  {METRICS.map((metric) => (
                    <div key={metric.label} className="lp-org-metric">
                      <LandingIcon name={metric.icon} size={17} />
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <small>{metric.delta}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lp-org-features">
            {BENEFITS.map((item) => (
              <article key={item.title} className="lp-org-feature">
                <span className="lp-org-feature-icon">
                  <LandingIcon name={item.icon} size={20} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <span className="lp-org-feature-link">
                    Learn more
                    <LandingIcon name="arrow-right" size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
