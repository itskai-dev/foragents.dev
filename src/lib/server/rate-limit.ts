import "server-only";

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

type Bucket = {
  windowStartMs: number;
  count: number;
};

const buckets = new Map<string, Bucket>();

function getWindowStartMs(nowMs: number, windowMs: number): number {
  return Math.floor(nowMs / windowMs) * windowMs;
}

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
  nowMs?: number;
}): RateLimitResult {
  const nowMs = params.nowMs ?? Date.now();
  const windowStartMs = getWindowStartMs(nowMs, params.windowMs);

  const existing = buckets.get(params.key);
  const bucket =
    existing && existing.windowStartMs === windowStartMs
      ? existing
      : { windowStartMs, count: 0 };

  bucket.count += 1;
  buckets.set(params.key, bucket);

  if (bucket.count > params.limit) {
    const retryAfterMs = windowStartMs + params.windowMs - nowMs;
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return { ok: false, retryAfterSec };
  }

  // Best-effort cleanup: drop very old buckets.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (nowMs - b.windowStartMs > params.windowMs * 2) buckets.delete(k);
    }
  }

  return { ok: true };
}
