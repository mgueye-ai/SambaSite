import Link from 'next/link';
import SambaLogo from '../SambaLogo';

export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-inner">
        <Link href="/" className="lp-brand">
          <SambaLogo size={34} className="lp-brand-logo" />
          Samba
        </Link>
        <div className="lp-footer-links">
          <Link href="/explore">Events</Link>
          <a href="#organizers">For Organizers</a>
          <a href="#categories">About</a>
          <Link href="/tickets/lookup">Find my ticket</Link>
          <Link href="/login">Sign in</Link>
        </div>
        <p>© 2026 Samba. Premium events across Africa.</p>
      </div>
    </footer>
  );
}
