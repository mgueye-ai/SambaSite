import { notFound } from 'next/navigation';
import ScannerInviteView from '../../../../components/ScannerInviteView';
import { fetchScannerInvitePreview } from '../../../../lib/scanner-invite';
import { scannerInviteUniversalUrl } from '../../../../lib/app-links';
import { SITE_URL } from '../../../../lib/config';
import '../../../ticket-share.css';

export async function generateMetadata({ params }) {
  const { token } = await params;
  const preview = await fetchScannerInvitePreview(token);

  if (!preview) {
    return {
      title: 'Invite Not Found — Samba',
      description: 'This scanner invite link is invalid or has expired.',
    };
  }

  const description = `You're invited to scan tickets at ${preview.eventTitle} on Samba!`;

  const url = scannerInviteUniversalUrl(token);
  const ogImage = preview.eventImage || `${SITE_URL}/logo.png`;

  return {
    title: `Scan tickets at ${preview.eventTitle} — Samba`,
    description,
    openGraph: {
      title: preview.eventTitle,
      description,
      url,
      siteName: 'Samba',
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: preview.eventTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function ScannerInvitePage({ params }) {
  const { token } = await params;
  const preview = await fetchScannerInvitePreview(token);

  if (!preview) notFound();

  return <ScannerInviteView token={token} preview={preview} />;
}
