import { notFound } from 'next/navigation';
import SiteNav from '../../../../components/SiteNav';
import CheckoutForm from '../../../../components/CheckoutForm';
import { getEventById } from '../../../../lib/events';

export const metadata = { title: 'Checkout — Samba' };

export default async function CheckoutPage({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) notFound();

  return (
    <div className="checkout-wrap">
      <SiteNav />
      <CheckoutForm event={event} />
    </div>
  );
}
