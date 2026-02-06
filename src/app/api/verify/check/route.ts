import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';
import { safeFetch } from '@/lib/server/ssrf';
import {
  countRecentChecks,
  FETCH_TIMEOUT_MS,
  getVerificationById,
  isExpired,
  MAX_CHECKS_PER_HOUR,
  MAX_FETCH_BYTES,
  readResponseTextWithLimit,
  updateVerification,
  validateHttpsUrl,
} from '@/lib/verifications';

const MAX_JSON_BYTES = 4_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`verify:check:${ip}`, { windowMs: 60_000, max: 30 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);
    const verificationId = String(body?.verification_id ?? '').trim();
    const url = validateHttpsUrl(String(body?.url ?? ''));

    if (!verificationId) {
      return NextResponse.json(
        { status: 'failed', reason: 'missing_verification_id' },
        { status: 400 }
      );
    }

    const v = await getVerificationById(verificationId);
    if (!v) {
      return NextResponse.json(
        { status: 'failed', reason: 'verification_not_found' },
        { status: 404 }
      );
    }

    if (v.status === 'succeeded') {
      return NextResponse.json({ status: 'succeeded' });
    }

    if (isExpired(v.created_at)) {
      await updateVerification(v.id, {
        status: 'failed',
        checked_at: new Date().toISOString(),
        url,
        reason: 'code_expired',
      });
      return NextResponse.json({ status: 'failed', reason: 'code_expired' });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const checks = await countRecentChecks(v.handle, oneHourAgo);
    if (checks >= MAX_CHECKS_PER_HOUR) {
      return NextResponse.json(
        { status: 'failed', reason: 'rate_limited' },
        { status: 429 }
      );
    }

    const res = await safeFetch(url, {
      headers: {
        'User-Agent': 'forAgents.dev Verification Bot',
        Accept: 'text/html,text/plain;q=0.9,*/*;q=0.1',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      await updateVerification(v.id, {
        status: 'failed',
        checked_at: new Date().toISOString(),
        url,
        reason: `http_${res.status}`,
      });
      return NextResponse.json({ status: 'failed', reason: `http_${res.status}` });
    }

    const text = await readResponseTextWithLimit(res, MAX_FETCH_BYTES);

    const found = text.includes(v.code);
    if (!found) {
      await updateVerification(v.id, {
        status: 'failed',
        checked_at: new Date().toISOString(),
        url,
        reason: 'code_not_found',
      });
      return NextResponse.json({ status: 'failed', reason: 'code_not_found' });
    }

    await updateVerification(v.id, {
      status: 'succeeded',
      checked_at: new Date().toISOString(),
      url,
      reason: undefined,
    });

    return NextResponse.json({ status: 'succeeded' });
  } catch (err) {
    // readJsonWithLimit throws with { status: 413 } when the payload is too large.
    const status =
      typeof err === 'object' && err && 'status' in err
        ? Number((err as { status?: unknown }).status)
        : 400;
    if (status === 413) {
      return NextResponse.json({ status: 'failed', reason: 'payload_too_large' }, { status: 413 });
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ status: 'failed', reason: message }, { status: 400 });
  }
}
