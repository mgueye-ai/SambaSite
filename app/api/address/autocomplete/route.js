import { NextResponse } from 'next/server';
import { searchAddresses } from '../../../../lib/address-autocomplete';

export async function GET(request) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchAddresses(q, { limit: 6 });
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: 'Address lookup failed' }, { status: 502 });
  }
}
