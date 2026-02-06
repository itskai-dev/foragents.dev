import "server-only";

type Bucket = { windowStartMs: number; count: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const b = buckets.get(params.key);

  if (!b || now - b.windowStartMs >= params.windowMs) {
    buckets.set(params.key, { windowStartMs: now, count: 1 });
    return { ok: true };
  }

  if (b.count >= params.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((params.windowMs - (now - b.windowStartMs)) / 1000));
    return { ok: false, retryAfterSec };
  }

  b.count += 1;
  return { ok: true };
}

// Helpful for tests
export function _resetRateLimitForTests() {
  buckets.clear();
}
