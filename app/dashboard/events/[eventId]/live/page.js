import EventManagePage from '../../../../../components/event-manage/EventManagePage';

export default async function EventLivePage({ params }) {
  const { eventId } = await params;
  return <EventManagePage eventId={eventId} view="live" />;
}
