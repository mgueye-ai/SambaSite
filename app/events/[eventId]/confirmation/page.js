import SiteNav from '../../../../components/SiteNav';
import ConfirmationView from '../../../../components/ConfirmationView';

export const metadata = { title: 'Confirmation — Samba' };

export default async function ConfirmationPage({ params }) {
  const { eventId } = await params;

  return (
    <div className="confirmation-wrap">
      <SiteNav />
      <ConfirmationView eventId={eventId} />
    </div>
  );
}
