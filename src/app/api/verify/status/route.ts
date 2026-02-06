import { NextRequest, NextResponse } from 'next/server';
import { getLatestVerificationForHandle, isHandleVerified, normalizeHandle } from '@/lib/verifications';

export async function GET(req: NextRequest) {
  const handleParam = req.nextUrl.searchParams.get('handle');
  if (!handleParam) {
    return NextResponse.json({ error: 'handle is required' }, { status: 400 });
  }

  try {
    const handle = normalizeHandle(handleParam);
    const verified = await isHandleVerified(handle);
    const latest = await getLatestVerificationForHandle(handle);

    return NextResponse.json({
      handle,
      verified,
      latest: latest
        ? {
            id: latest.id,
            status: latest.status,
            created_at: latest.created_at,
            checked_at: latest.checked_at ?? null,
            url: latest.url ?? null,
            reason: latest.reason ?? null,
          }
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
