import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase-admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'Ticket lookup unavailable — service role key not configured' },
      { status: 503 }
    );
  }

  const { data, error } = await admin
    .from('tickets')
    .select('id, event_id, ticket_type, ticket_number, qr_code, price, status, purchase_date, buyer_name')
    .eq('buyer_email', email)
    .order('purchase_date', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data || [] });
}
