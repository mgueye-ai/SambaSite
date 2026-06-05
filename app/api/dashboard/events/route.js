import { NextResponse } from 'next/server';
import { getUserFromRequest, canAccessOrganizer } from '../../../../lib/server-auth';
import { updateEvent } from '../../../../lib/dashboard-data';

export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { eventId, organizerId, ...updates } = body;
  const targetOrganizer = organizerId || user.id;

  if (!eventId || !canAccessOrganizer(user, targetOrganizer)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const event = await updateEvent(targetOrganizer, eventId, updates);
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
