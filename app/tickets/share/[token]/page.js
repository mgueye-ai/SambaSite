import { notFound } from 'next/navigation';
import TicketShareView from '../../../../components/TicketShareView';
import { fetchTicketSharePreview } from '../../../../lib/ticket-share';
import { ticketShareUniversalUrl } from '../../../../lib/app-links';
import { SITE_URL } from '../../../../lib/config';
import '../../../ticket-share.css';

export async function generateMetadata({ params }) {
  const { token } = await params;
  const preview = await fetchTicketSharePreview(token);

  if (!preview) {
    return {
      title: 'Ticket Not Found — Samba',
      description: 'This ticket share link is invalid or has expired.',
    };
  }

  const description = preview.alreadyClaimed
    ? `${preview.eventTitle} — this ticket was already claimed.`
    : `Claim your ticket for ${preview.eventTitle} in the Samba app.`;

  const url = ticketShareUniversalUrl(token);
  const ogImage = preview.eventImage || `${SITE_URL}/logo.png`;

  return {
    title: `${preview.eventTitle} — Samba`,
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

export default async function TicketSharePage({ params }) {
  const { token } = await params;
  const preview = await fetchTicketSharePreview(token);

  if (!preview) notFound();

  return <TicketShareView token={token} preview={preview} />;
}
