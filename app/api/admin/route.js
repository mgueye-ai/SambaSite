import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../lib/server-auth';
import { fetchPlatformAdminData } from '../../../lib/dashboard-data';

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const data = await fetchPlatformAdminData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
