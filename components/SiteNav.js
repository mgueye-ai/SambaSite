import Link from 'next/link';
import NavAuthLink from './NavAuthLink';

export default function SiteNav({ showBack = false, showAuth = false }) {
  return (
    <nav className="site-nav">
      <Link href="/" className="logo">Samba</Link>
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
