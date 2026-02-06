import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ status: 'failed', reason: message }, { status: 400 });
  }
}
