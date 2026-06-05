import Link from 'next/link';
import NavAuthLink from './NavAuthLink';
import SambaLogo from './SambaLogo';

export default function SiteNav({ showBack = false, showAuth = false }) {
  return (
    <nav className="site-nav">
      <Link href="/" className="logo">
        <SambaLogo size={30} className="site-logo-icon" />
        Samba
      </Link>
      {showBack ? (
        <Link href="/" className="back-link">← Back</Link>
      ) : (
        <>
          <ul className="nav-links">
            <li><a href="/#fans">For Fans</a></li>
            <li><a href="/#organizers">For Organizers</a></li>
            <li><a href="/#features">Features</a></li>
          </ul>
          {showAuth && <NavAuthLink />}
        </>
      )}
    </nav>
  );
}
