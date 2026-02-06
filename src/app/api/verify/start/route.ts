import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';
import { createVerification, normalizeHandle } from '@/lib/verifications';

const MAX_JSON_BYTES = 2_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`verify:start:${ip}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);
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
    // readJsonWithLimit throws with { status: 413 } when the payload is too large.
    const status =
      typeof err === 'object' && err && 'status' in err
        ? Number((err as { status?: unknown }).status)
        : 400;
    if (status === 413) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
