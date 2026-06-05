import Link from 'next/link';
import SiteNav from '../components/SiteNav';

export default function HomePage() {
  return (
    <>
      <SiteNav showDashboard />
      <header className="hero">
        <div className="hero-glow" />
        <div className="hero-inner">
          <p className="eyebrow">Events · Tickets · Analytics</p>
          <h1>The ticket platform built for nights you&apos;ll remember</h1>
          <p className="hero-lead">
            Samba connects fans to the best local events and gives organizers everything they need
            to sell tickets, manage attendees, and run the door — all from one place.
          </p>
          <div className="hero-cta">
            <a href="#fans" className="btn-primary">Explore for Fans</a>
            <Link href="/login" className="btn-secondary">Organizer Login</Link>
          </div>
        </div>
      </header>

      <section id="fans" className="section split-section">
        <div className="split-content">
          <span className="section-tag">For Fans</span>
          <h2>Find your next night out</h2>
          <p>Browse concerts, parties, festivals, and more. Buy tickets in seconds and get a digital QR code delivered straight to your phone.</p>
          <ul className="feature-list">
            <li>Discover events near you on the map</li>
            <li>Filter by music, nightlife, sports, food & more</li>
            <li>Instant digital tickets with QR check-in</li>
            <li>Follow your favorite organizers</li>
            <li>Share event links and buy tickets on the web</li>
          </ul>
          <p className="coming-soon">Mobile app available on iOS & Android</p>
        </div>
        <div className="split-visual fan-visual">
          <div className="visual-card">
            <div className="visual-card-header">
              <span className="pill">Tonight</span>
              <span className="pill accent">12 spots left</span>
            </div>
            <h3>Friday Latin Social</h3>
            <p>Downtown Club · 9:00 PM</p>
            <span className="price-tag">From $25</span>
          </div>
        </div>
      </section>

      <section id="organizers" className="section split-section reverse">
        <div className="split-content">
          <span className="section-tag accent">For Organizers</span>
          <h2>Run events like a pro</h2>
          <p>Create events, set ticket tiers, track sales in real time, and scan guests at the door. Share a link — fans buy tickets without an account.</p>
          <ul className="feature-list">
            <li>Create & manage events with custom ticket types</li>
            <li>Real-time sales analytics and revenue tracking</li>
            <li>QR code scanner for door check-in</li>
            <li>Live event stats during your event</li>
            <li>Web checkout from shared event links</li>
          </ul>
          <Link href="/login" className="btn-primary">Go to Dashboard</Link>
        </div>
        <div className="split-visual org-visual">
          <div className="stat-preview">
            <div className="stat-preview-label">Revenue · This month</div>
            <div className="stat-preview-value">$4.2k</div>
            <div className="stat-preview-row">
              <div><strong>8</strong><span>Events</span></div>
              <div><strong>312</strong><span>Tickets</span></div>
              <div><strong>78%</strong><span>Fill rate</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-center">
          <span className="section-tag">Platform</span>
          <h2>Everything in one platform</h2>
          <p className="section-sub">Built for both sides of the event — the crowd and the crew behind it.</p>
        </div>
        <div className="features-grid">
          {[
            ['🎟️', 'Digital Tickets', 'QR codes delivered instantly. Buy on the web or in the app.'],
            ['🔗', 'Shareable Links', 'Organizers share event links — fans buy tickets without signing up.'],
            ['📊', 'Live Analytics', 'Track ticket sales, revenue, check-ins, and capacity in real time.'],
            ['📱', 'Door Scanner', 'Staff scan QR codes at the door. Fast entry, no fraud.'],
            ['💳', 'Secure Payments', 'Stripe-powered checkout with organizer payouts.'],
            ['👥', 'Guest Management', 'View attendees, manage guest lists, and track check-ins.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="feature-card">
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section how-section">
        <div className="section-center"><h2>How it works</h2></div>
        <div className="how-grid">
          <div className="how-col">
            <h3>For Fans</h3>
            {[
              ['Discover', 'Get a shared link or browse events in the app.'],
              ['Buy', 'Pick tickets on the web — no account needed.'],
              ['Go', 'Show your QR at the door. You\'re in.'],
            ].map(([t, d], i) => (
              <div key={t} className="how-step">
                <span className="step-num">{i + 1}</span>
                <div><strong>{t}</strong><p>{d}</p></div>
              </div>
            ))}
          </div>
          <div className="how-col">
            <h3>For Organizers</h3>
            {[
              ['Create', 'Set up your event, venue, and ticket tiers in the app.'],
              ['Share', 'Tap Share — fans get a link to buy tickets on the web.'],
              ['Host', 'Scan tickets, track stats, and run the night.'],
            ].map(([t, d], i) => (
              <div key={t} className="how-step">
                <span className="step-num">{i + 1}</span>
                <div><strong>{t}</strong><p>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to host your next event?</h2>
        <p>Sign in to your organizer dashboard or share event links so fans can buy tickets instantly.</p>
        <Link href="/login" className="btn-primary btn-lg">Organizer Dashboard</Link>
      </section>

      <footer className="site-footer">
        <Link href="/" className="logo">Samba</Link>
        <p>© 2026 Samba. Ticket platform for fans & organizers.</p>
      </footer>
    </>
  );
}
