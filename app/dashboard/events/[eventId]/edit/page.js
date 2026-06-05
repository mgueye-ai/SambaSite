import EventManagePage from '../../../../../components/event-manage/EventManagePage';

export default async function EventEditPage({ params }) {
  const { eventId } = await params;
  return <EventManagePage eventId={eventId} view="edit" />;
}
