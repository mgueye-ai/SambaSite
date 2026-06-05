import { NextResponse } from 'next/server';
import { processPurchase } from '../../../lib/purchase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, tickets, buyer, paymentId, paymentStatus } = body;

    if (!eventId || !tickets || !buyer?.name || !buyer?.email) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, tickets, buyer.name, buyer.email' },
        { status: 400 }
      );
    }

    const result = await processPurchase({
      eventId,
      tickets,
      buyer,
      paymentId,
      paymentStatus,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Purchase error:', err);
    return NextResponse.json(
      { error: err.message || 'Purchase failed' },
      { status: 400 }
    );
  }
}
