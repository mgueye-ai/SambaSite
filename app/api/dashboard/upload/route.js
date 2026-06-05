import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../lib/server-auth';
import { createAdminClient } from '../../../../lib/supabase-admin';

const BUCKETS = ['app-assets', 'provider-assets'];

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user || (user.role !== 'provider' && user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'events/draft';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const storagePath = `${user.id}/${folder}/cover-${Date.now()}.${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`;

    let publicUrl = null;
    for (const bucket of BUCKETS) {
      const { error } = await admin.storage.from(bucket).upload(storagePath, buffer, {
        upsert: true,
        contentType,
      });
      if (!error) {
        const { data } = admin.storage.from(bucket).getPublicUrl(storagePath);
        publicUrl = data.publicUrl;
        break;
      }
    }

    if (!publicUrl) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
