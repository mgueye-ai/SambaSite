import { NextResponse } from 'next/server';
import { getUserFromRequest, canAccessOrganizer, getDbClientForUser } from '../../../lib/server-auth';
import { fetchOrganizerDashboardData } from '../../../lib/dashboard-data';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const data = await fetchOrganizerDashboardData(organizerId, db);
    return NextResponse.json({ ...data, actingAsAdmin: user.role === 'admin' && user.id !== organizerId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
