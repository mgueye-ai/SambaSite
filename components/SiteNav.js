import Link from 'next/link';
import DashboardLoginDropdown from './DashboardLoginDropdown';

export default function SiteNav({ active = null, showBack = false, showDashboard = false }) {
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
          {showDashboard && (
            <DashboardLoginDropdown active={active === 'dashboard'} />
          )}
        </>
      )}
    </nav>
  );
}
