import Link from 'next/link';

export default function SiteNav({ active = null, showBack = false }) {
  return (
    <nav className="site-nav">
      <Link href="/" className="logo">Samba</Link>
      {showBack ? (
        <Link href="/" className="back-link">← Back to site</Link>
      ) : (
        <>
          <ul className="nav-links">
            <li><a href="/#fans">For Fans</a></li>
            <li><a href="/#organizers">For Organizers</a></li>
            <li><a href="/#features">Features</a></li>
          </ul>
          <Link href="/login" className={`btn-nav ${active === 'dashboard' ? 'active' : ''}`}>
            Organizer Dashboard
          </Link>
        </>
      )}
    </nav>
  );
}
