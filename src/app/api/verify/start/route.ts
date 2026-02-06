import { NextRequest, NextResponse } from 'next/server';
import { createVerification, normalizeHandle } from '@/lib/verifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const handle = normalizeHandle(String(body?.handle ?? ''));

    const v = await createVerification(handle);

    const instructions = [
      `1) Publish this verification code on a public HTTPS page you control:`,
      '',
      v.code,
      '',
      `2) Then call POST /api/verify/check with:`,
      `   { "verification_id": "${v.id}", "url": "https://..." }`,
      '',
      `The page can be anything (a profile, README, blog post) as long as the code appears in the HTML/text response body.`,
    ].join('\n');

    return NextResponse.json({
      verification_id: v.id,
      code: v.code,
      instructions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
