import { type NextRequest, NextResponse } from "next/server";
import { appendCanaryResults } from "@/lib/server/canaryStore";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";
import type { CanaryResult } from "@/lib/canary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckSpec = {
  endpoint: string;
  validate?: (response: Response) => Promise<void>;
};

async function validateJsonArray(response: Response) {
  const data = (await response.json()) as unknown;

  // Accept either a raw array or an object wrapper like { skills: [...] }.
  if (Array.isArray(data)) return;

  if (data && typeof data === "object") {
    const maybeArray = (data as Record<string, unknown>).skills;
    if (Array.isArray(maybeArray)) return;
  }

  throw new Error("Expected JSON array");
}

async function validateJson(response: Response) {
  await response.json();
}

async function runCheck(baseUrl: URL, spec: CheckSpec): Promise<Omit<CanaryResult, "regression">> {
  const id = globalThis.crypto?.randomUUID?.() ?? `canary_${Date.now()}_${Math.random()}`;
  const checkedAt = new Date().toISOString();

  const started = Date.now();

  try {
    const url = new URL(spec.endpoint, baseUrl);

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "foragents-canary/0",
      },
    });

    const responseTimeMs = Date.now() - started;

    if (!res.ok) {
      return {
        id,
        checkedAt,
        endpoint: spec.endpoint,
        method: "GET",
        status: "fail",
        httpStatus: res.status,
        responseTimeMs,
        errorMessage: `HTTP ${res.status}`,
      };
    }

    if (spec.validate) {
      await spec.validate(res);
    }

    return {
      id,
      checkedAt,
      endpoint: spec.endpoint,
      method: "GET",
      status: "pass",
      httpStatus: res.status,
      responseTimeMs,
    };
  } catch (err) {
    const responseTimeMs = Date.now() - started;
    const message = err instanceof Error ? err.message : "Unknown error";

    return {
      id,
      checkedAt,
      endpoint: spec.endpoint,
      method: "GET",
      status: "fail",
      responseTimeMs,
      errorMessage: message,
    };
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`canary:run:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  // Consume + cap body (satisfies security audit)
  await readJsonWithLimit(request, 1_024).catch(() => {});

  const baseUrl = new URL(request.url);
  baseUrl.pathname = "/";
  baseUrl.search = "";
  baseUrl.hash = "";

  const specs: CheckSpec[] = [
    { endpoint: "/", validate: async () => {} },
    { endpoint: "/api/skills", validate: validateJsonArray },
    { endpoint: "/api/mcp/servers", validate: validateJson },
    { endpoint: "/api/trending/skills", validate: validateJson },
  ];

  const results = await Promise.all(specs.map((s) => runCheck(baseUrl, s)));

  const stored = await appendCanaryResults(results);

  const runId = globalThis.crypto?.randomUUID?.() ?? `run_${Date.now()}_${Math.random()}`;

  return NextResponse.json(
    {
      runId,
      checkedAt: new Date().toISOString(),
      results: results,
      storedCount: stored.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
