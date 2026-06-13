import Link from 'next/link';
import '../../../ticket-share.css';

export default function TicketShareNotFound() {
  return (
    <div className="tsx-root">
      <div className="tsx-error">
        <h1>Link not found</h1>
        <p>This ticket share link is invalid, expired, or has already been removed.</p>
        <Link href="/explore">Explore events</Link>
      </div>
    </div>
  );
}
