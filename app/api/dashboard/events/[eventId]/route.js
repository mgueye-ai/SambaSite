import { NextResponse } from 'next/server';
import { getUserFromRequest, canAccessOrganizer, getDbClientForUser } from '../../../../../lib/server-auth';
import { fetchOrganizerEventDetail, updateEvent } from '../../../../../lib/dashboard-data';

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const organizerId = searchParams.get('organizerId') || user.id;

  if (!canAccessOrganizer(user, organizerId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getDbClientForUser(request, user, organizerId);
  if (!db) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  try {
    const data = await fetchOrganizerEventDetail(organizerId, eventId, db);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.message === 'Event not found' ? 404 : 400 });
  }
}

export async function PATCH(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventId } = await params;
  const body = await request.json();
  const targetOrganizer = body.organizerId || user.id;

  if (!canAccessOrganizer(user, targetOrganizer)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getDbClientForUser(request, user, targetOrganizer);
  if (!db) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  try {
    const event = await updateEvent(targetOrganizer, eventId, body, db);
    return NextResponse.json({ event });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
