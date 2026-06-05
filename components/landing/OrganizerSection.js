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

const BARS = [38, 55, 47, 72, 64, 88, 76];

export default function OrganizerSection() {
  return (
    <section className="lp-section lp-org-section" id="organizers">
      <div className="lp-container">
        <div className="lp-org-shell">
          <div className="lp-org-copy">
            <span className="lp-kicker">Built for organizers</span>
            <h2>Run unforgettable events, end to end.</h2>
            <p>
              Everything you need to launch, sell, and manage an event — from your first
              ticket to the final check-in at the door.
            </p>

            <div className="lp-org-features">
              {BENEFITS.map((item) => (
                <article key={item.title} className="lp-org-feature">
                  <span className="lp-org-feature-icon">
                    <LandingIcon name={item.icon} size={18} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>

            <Link href="/login" className="lp-btn lp-btn-primary lp-btn-lg">
              List Your Event
              <LandingIcon name="arrow-right" size={16} />
            </Link>
          </div>

          <div className="lp-org-visual">
            <div className="lp-org-panel">
              <div className="lp-org-panel-glow" aria-hidden="true" />

              <div className="lp-org-panel-head">
                <div className="lp-org-panel-titleblock">
                  <span className="lp-org-panel-label">Revenue · This month</span>
                  <div className="lp-org-panel-value-row">
                    <strong className="lp-org-panel-value">₦4.2M</strong>
                    <span className="lp-org-chip">
                      <LandingIcon name="spark" size={14} />
                      <span>+18% vs last month</span>
                    </span>
                  </div>
                </div>
                <span className="lp-org-panel-pill">
                  <span className="lp-org-panel-live" aria-hidden="true" />
                  Live
                </span>
              </div>

              <div className="lp-org-bars" aria-hidden="true">
                {BARS.map((h, i) => (
                  <span key={i} className="lp-org-bar" style={{ height: `${h}%` }} />
                ))}
              </div>

              <div className="lp-org-metrics">
                <div className="lp-org-metric">
                  <LandingIcon name="ticket" size={16} />
                  <span>Tickets sold</span>
                  <strong>1,284</strong>
                </div>
                <div className="lp-org-metric">
                  <LandingIcon name="users" size={16} />
                  <span>Checked in</span>
                  <strong>912</strong>
                </div>
                <div className="lp-org-metric">
                  <LandingIcon name="chart" size={16} />
                  <span>Fill rate</span>
                  <strong>87%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
