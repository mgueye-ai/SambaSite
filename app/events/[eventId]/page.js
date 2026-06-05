import { notFound } from 'next/navigation';
import SiteNav from '../../../components/SiteNav';
import TicketPicker from '../../../components/TicketPicker';
import { getEventById } from '../../../lib/events';
import { SITE_URL } from '../../../lib/config';

export async function generateMetadata({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) return { title: 'Event Not Found — Samba' };

  const description = event.description?.slice(0, 160) || `${event.title} — ${event.dateLabel} at ${event.venue}`;
  const url = `${SITE_URL}/events/${eventId}`;

  return {
    title: `${event.title} — Samba`,
    description,
    openGraph: {
      title: event.title,
      description,
      url,
      images: event.coverImage ? [{ url: event.coverImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}

export default async function EventPage({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) notFound();

  const organizerName =
    event.organizer?.organizationName || event.organizer?.name || 'Event Organizer';

  return (
    <div className="event-page">
      <SiteNav />
      <div className="event-hero">
        {event.coverImage ? (
          <img src={event.coverImage} alt="" className="event-cover" />
        ) : (
          <div className="event-cover fallback" />
        )}
        <div className="event-hero-overlay" />
        <div className="event-hero-content">
          <span className="event-category">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="event-datetime">
            {event.dateLabel}{event.timeLabel ? ` · ${event.timeLabel}` : ''}
          </p>
          <p className="event-venue">📍 {event.formattedAddress}</p>
          {event.isLive && (
            <span className="live-pill"><span className="live-dot" /> Live Now</span>
          )}
        </div>
      </div>

      <div className="event-body">
        <div className="event-details">
          <div className="organizer-block">
            <h3>Organizer</h3>
            <p>{organizerName}</p>
          </div>
          {event.description && (
            <div className="description-block">
              <h3>About</h3>
              <p>{event.description}</p>
            </div>
          )}
          <p className="share-note">
            Shared from the Samba app · <a href="/">samba-site-woad.vercel.app</a>
          </p>
        </div>
        <TicketPicker event={event} />
      </div>
    </div>
  );
}
