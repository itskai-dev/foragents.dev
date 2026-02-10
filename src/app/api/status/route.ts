import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";

type StatusLevel = "operational" | "degraded" | "down";

interface ServiceHealth {
  name: string;
  status: StatusLevel;
  latencyMs: number;
  lastCheck: string;
}

const execFileAsync = promisify(execFile);

function createOriginFromRequest(request: NextRequest): string {
  const protocol = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!host) return "http://localhost:3000";

  return `${protocol}://${host}`;
}

function resolveOverallStatus(services: ServiceHealth[]): StatusLevel {
  if (services.some((service) => service.status === "down")) return "down";
  if (services.some((service) => service.status === "degraded")) return "degraded";
  return "operational";
}

async function runSelfCheck(origin: string): Promise<ServiceHealth> {
  const startedAt = Date.now();
  let status: StatusLevel = "operational";

  try {
    const response = await fetch(`${origin}/api/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      status = response.status >= 500 ? "down" : "degraded";
    }
  } catch {
    status = "down";
  }

  return {
    name: "API",
    status,
    latencyMs: Date.now() - startedAt,
    lastCheck: new Date().toISOString(),
  };
}

async function runSupabaseCheck(): Promise<ServiceHealth> {
  const startedAt = Date.now();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  let status: StatusLevel = "operational";

  if (!supabaseUrl || !supabaseAnonKey) {
    status = "degraded";
  } else {
    try {
      const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/`, {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });

      if (response.status >= 500) {
        status = "down";
      } else if (response.status >= 400) {
        status = "degraded";
      }
    } catch {
      status = "down";
    }
  }

  return {
    name: "Supabase",
    status,
    latencyMs: Date.now() - startedAt,
    lastCheck: new Date().toISOString(),
  };
}

async function runGitHubCheck(): Promise<ServiceHealth> {
  const startedAt = Date.now();
  let status: StatusLevel = "operational";

  try {
    const { stdout } = await execFileAsync("gh", ["api", "rate_limit"], {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });

    const parsed = JSON.parse(stdout) as {
      resources?: {
        core?: {
          remaining?: number;
        };
      };
    };

    const remaining = parsed.resources?.core?.remaining;
    if (typeof remaining !== "number") {
      status = "degraded";
    } else if (remaining <= 0) {
      status = "down";
    } else if (remaining < 100) {
      status = "degraded";
    }
  } catch {
    status = "down";
  }

  return {
    name: "GitHub API",
    status,
    latencyMs: Date.now() - startedAt,
    lastCheck: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const origin = createOriginFromRequest(request);

  const services = await Promise.all([
    runSelfCheck(origin),
    runSupabaseCheck(),
    runGitHubCheck(),
  ]);

  return NextResponse.json(
    {
      services,
      overall: resolveOverallStatus(services),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
