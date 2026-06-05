import EventManagePage from '../../../../../components/event-manage/EventManagePage';

export default async function EventStatsPage({ params }) {
  const { eventId } = await params;
  return <EventManagePage eventId={eventId} view="stats" />;
}
