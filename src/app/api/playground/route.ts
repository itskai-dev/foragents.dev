import { NextRequest, NextResponse } from "next/server";

import curatedEndpoints from "../../../../data/api-endpoints.json";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

type PlaygroundRequest = {
  endpoint?: unknown;
  method?: unknown;
  params?: unknown;
};

type EndpointDefinition = {
  path: string;
  method: string;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const ALLOWED_METHODS = new Set<RequestMethod>(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitStore = new Map<string, RateLimitState>();
const allowedEndpointKeys = new Set(
  (curatedEndpoints as EndpointDefinition[]).map((endpoint) => {
    const method = endpoint.method.toUpperCase();
    return `${method} ${endpoint.path}`;
  })
);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const firstForwarded = forwarded.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();

  return firstForwarded || realIp || cfIp || "unknown";
}

function checkRateLimit(ip: string): { ok: boolean; remaining: number; resetAt: number; retryAfterSec?: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    const nextState: RateLimitState = { count: 1, resetAt };
    rateLimitStore.set(ip, nextState);
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt };
  }

  const nextCount = existing.count + 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - nextCount);

  if (nextCount > RATE_LIMIT_MAX) {
    return {
      ok: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count = nextCount;
  rateLimitStore.set(ip, existing);

  return { ok: true, remaining, resetAt: existing.resetAt };
}

function withRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));
  return response;
}

function normalizeMethod(input: unknown): RequestMethod | null {
  if (typeof input !== "string") return null;
  const method = input.toUpperCase() as RequestMethod;
  return ALLOWED_METHODS.has(method) ? method : null;
}

function normalizeEndpoint(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const endpoint = input.trim();
  if (!endpoint.startsWith("/api/")) return null;
  if (endpoint.startsWith("/api/playground")) return null;
  if (endpoint.includes("..") || endpoint.includes("://")) return null;
  return endpoint;
}

function normalizeParams(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return input as Record<string, unknown>;
}

function replacePathParams(endpoint: string, params: Record<string, unknown>): { path: string; usedKeys: Set<string> } {
  const usedKeys = new Set<string>();
  const path = endpoint.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = params[key];
    if (typeof value === "undefined" || value === null || String(value).trim() === "") {
      return `{${key}}`;
    }

    usedKeys.add(key);
    return encodeURIComponent(String(value));
  });

  return { path, usedKeys };
}

function buildTargetUrl(
  endpoint: string,
  method: RequestMethod,
  params: Record<string, unknown>,
  origin: string
): { url: string; body?: string } {
  const { path, usedKeys } = replacePathParams(endpoint, params);
  const url = new URL(path, origin);

  if (method === "GET" || method === "HEAD") {
    Object.entries(params).forEach(([key, value]) => {
      if (usedKeys.has(key) || typeof value === "undefined" || value === null) return;
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      if (serialized.trim().length === 0) return;
      url.searchParams.set(key, serialized);
    });
    return { url: url.toString() };
  }

  const body: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (usedKeys.has(key) || typeof value === "undefined") return;
    body[key] = value;
  });

  return { url: url.toString(), body: JSON.stringify(body) };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip);

  if (!rl.ok) {
    const limited = NextResponse.json(
      { error: "Rate limit exceeded. Max 10 requests per minute per IP." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.retryAfterSec ?? 60),
        },
      }
    );
    return withRateLimitHeaders(limited, rl.remaining, rl.resetAt);
  }

  let payload: PlaygroundRequest;
  try {
    payload = (await request.json()) as PlaygroundRequest;
  } catch {
    const invalidJson = NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    return withRateLimitHeaders(invalidJson, rl.remaining, rl.resetAt);
  }

  const method = normalizeMethod(payload.method);
  const endpoint = normalizeEndpoint(payload.endpoint);

  if (!method || !endpoint) {
    const invalid = NextResponse.json(
      { error: "Invalid request. Expected { endpoint, method, params }." },
      { status: 400 }
    );
    return withRateLimitHeaders(invalid, rl.remaining, rl.resetAt);
  }

  if (!allowedEndpointKeys.has(`${method} ${endpoint}`)) {
    const notAllowed = NextResponse.json(
      { error: "Endpoint or method is not available in the curated playground list." },
      { status: 403 }
    );
    return withRateLimitHeaders(notAllowed, rl.remaining, rl.resetAt);
  }

  const params = normalizeParams(payload.params);
  const target = buildTargetUrl(endpoint, method, params, request.nextUrl.origin);

  const upstreamHeaders: Record<string, string> = {
    Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
  };

  const authorization = request.headers.get("authorization");
  if (authorization) upstreamHeaders["Authorization"] = authorization;

  const cookie = request.headers.get("cookie");
  if (cookie) upstreamHeaders["Cookie"] = cookie;

  if (target.body && method !== "GET" && method !== "HEAD") {
    upstreamHeaders["Content-Type"] = "application/json";
  }

  const startedAt = performance.now();

  try {
    const upstreamResponse = await fetch(target.url, {
      method,
      headers: upstreamHeaders,
      body: target.body,
      cache: "no-store",
    });

    const durationMs = Math.round(performance.now() - startedAt);

    const headers: Record<string, string> = {};
    upstreamResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return;
      headers[key] = value;
    });

    const contentType = upstreamResponse.headers.get("content-type") || "";
    const rawText = await upstreamResponse.text();
    let data: unknown = rawText;

    if (contentType.includes("application/json")) {
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = rawText;
      }
    }

    const response = NextResponse.json(
      {
        endpoint,
        method,
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers,
        durationMs,
        data,
      },
      { status: upstreamResponse.status }
    );

    return withRateLimitHeaders(response, rl.remaining, rl.resetAt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reach upstream API route";
    const failure = NextResponse.json(
      {
        endpoint,
        method,
        error: message,
      },
      { status: 502 }
    );
    return withRateLimitHeaders(failure, rl.remaining, rl.resetAt);
  }
}
