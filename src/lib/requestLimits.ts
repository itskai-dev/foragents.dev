import { NextRequest, NextResponse } from "next/server";

export type RateLimitConfig = {
  windowMs: number;
  max: number;
};

// NOTE: in-memory (per-instance) rate limit.
// Good enough for MVP; replace with durable store (Redis) if needed.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  // NextRequest.ip is not always present (depends on runtime), but use it if it is.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ip = (req as any).ip;
  return typeof ip === "string" && ip ? ip : "unknown";
}

export function checkRateLimit(key: string, cfg: RateLimitConfig): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { ok: true };
  }

  if (entry.count >= cfg.max) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  entry.count += 1;
  buckets.set(key, entry);
  return { ok: true };
}

export function rateLimitResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}

export async function readJsonWithLimit<T extends Record<string, unknown>>(
  req: NextRequest,
  maxBytes: number
): Promise<T> {
  // In production NextRequest.body should be a stream. In some test setups
  // (and some runtimes), it may be null. Fall back to req.text() there.
  const body = req.body;

  if (!body) {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf-8") > maxBytes) {
      throw Object.assign(new Error("payload too large"), { status: 413 });
    }
    const json = JSON.parse(raw) as unknown;
    if (!json || typeof json !== "object" || Array.isArray(json)) {
      throw new Error("invalid json object");
    }
    return json as T;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    received += value.byteLength;
    if (received > maxBytes) {
      throw Object.assign(new Error("payload too large"), { status: 413 });
    }

    chunks.push(value);
  }

  const text = new TextDecoder("utf-8").decode(concatChunks(chunks, received));
  const json = JSON.parse(text) as unknown;
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw new Error("invalid json object");
  }
  return json as T;
}

function concatChunks(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}
