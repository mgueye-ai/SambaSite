import Link from 'next/link';
import '../../../ticket-share.css';

export default function ScannerInviteNotFound() {
  return (
    <div className="tsx-root">
      <div className="tsx-error">
        <h1>Invite not found</h1>
        <p>This scanner invite link is invalid, expired, or has already been removed.</p>
        <Link href="/explore">Explore events</Link>
      </div>
    </div>
  );
}
