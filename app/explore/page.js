import ExploreView from '../../components/ExploreView';
import { getExploreEvents } from '../../lib/events';

export const metadata = {
  title: 'Explore — Samba',
  description: 'Discover upcoming events near you on Samba.',
};

export default async function ExplorePage() {
  const events = await getExploreEvents();

  const eventData = events.map((event) => ({
    ...event,
    date: event.date?.toISOString() ?? null,
    startTime: event.startTime?.toISOString() ?? null,
    endTime: event.endTime?.toISOString() ?? null,
  }));

  return <ExploreView events={eventData} />;
}
