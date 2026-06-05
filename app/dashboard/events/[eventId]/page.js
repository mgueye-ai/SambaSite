import EventManagePage from '../../../../components/event-manage/EventManagePage';

export default async function EventManageRoot({ params }) {
  const { eventId } = await params;
  return <EventManagePage eventId={eventId} view={null} />;
}
