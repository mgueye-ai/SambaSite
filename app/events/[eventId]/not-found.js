import Link from 'next/link';
import SiteNav from '../../../components/SiteNav';

export default function EventNotFound() {
  return (
    <div className="event-page">
      <SiteNav />
      <div className="state-box" style={{ paddingTop: 120 }}>
        <h3>Event not found</h3>
        <p>This event may have been removed or the link is invalid.</p>
        <Link href="/" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          Back to Samba
        </Link>
      </div>
    </div>
  );
}
