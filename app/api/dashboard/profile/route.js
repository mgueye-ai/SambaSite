import { NextResponse } from 'next/server';
import { getUserFromRequest, canAccessOrganizer, getDbClientForUser } from '../../../../lib/server-auth';
import { updateOrganizerProfile } from '../../../../lib/profile-update';

export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const profile = await updateOrganizerProfile(targetOrganizer, body, db);
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
