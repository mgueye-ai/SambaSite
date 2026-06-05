import { notFound } from 'next/navigation';
import EventDetailsView from '../../../components/EventDetailsView';
import { getEventById } from '../../../lib/events';
import { SITE_URL } from '../../../lib/config';

export async function generateMetadata({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) return { title: 'Event Not Found — Samba' };

  const description = event.description?.slice(0, 160) || `${event.title} — ${event.dateLabel} at ${event.venue}`;
  const url = `${SITE_URL}/events/${eventId}`;
  const ogImage = event.coverImage || `${SITE_URL}/icon`;

  return {
    title: `${event.title} — Samba`,
    description,
    openGraph: {
      title: event.title,
      description,
      url,
      siteName: 'Samba',
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventPage({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) notFound();

  const eventData = {
    ...event,
    date: event.date?.toISOString() ?? null,
    startTime: event.startTime?.toISOString() ?? null,
    endTime: event.endTime?.toISOString() ?? null,
  };

  return <EventDetailsView event={eventData} />;
}
