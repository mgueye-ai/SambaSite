import Link from 'next/link';
import NavAuthLink from '../NavAuthLink';
import SambaLogo from '../SambaLogo';

export default function LandingNav() {
  return (
    <nav className="lp-nav">
      <Link href="/" className="lp-brand">
        <SambaLogo size={34} className="lp-brand-logo" />
        Samba
      </Link>

      <ul className="lp-nav-links">
        <li><Link href="/explore">Events</Link></li>
        <li><a href="#organizers">For Organizers</a></li>
        <li><a href="#categories">About</a></li>
        <li><Link href="/tickets/lookup">Help</Link></li>
      </ul>

      <div className="lp-nav-cta">
        <span className="lp-nav-signin"><NavAuthLink /></span>
        <Link href="/explore" className="lp-btn lp-btn-primary">Explore Events</Link>
      </div>
    </nav>
  );
}
