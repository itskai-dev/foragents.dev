import { NextRequest, NextResponse } from "next/server";
import { appendHealthEvent, type HealthEventStatus } from "@/lib/agentHealth";
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";

const MAX_JSON_BYTES = 16_000;

function isIsoDateString(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const t = Date.parse(v);
  return Number.isFinite(t);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function validate(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (typeof body.agentId !== "string" || body.agentId.trim().length === 0) {
    errors.push("agentId is required");
  }

  const status = body.status;
  if (status !== "heartbeat" && status !== "error" && status !== "completion") {
    errors.push('status must be one of: "heartbeat" | "error" | "completion"');
  }

  if ("runId" in body && body.runId != null && typeof body.runId !== "string") {
    errors.push("runId must be a string");
  }

  if ("agentType" in body && body.agentType != null && typeof body.agentType !== "string") {
    errors.push("agentType must be a string");
  }

  if ("message" in body && body.message != null && typeof body.message !== "string") {
    errors.push("message must be a string");
  }

  if ("progress" in body && body.progress != null) {
    const p = body.progress;
    if (typeof p !== "string" && typeof p !== "number") {
      errors.push("progress must be a string or number");
    }
  }

  if ("durationMs" in body && body.durationMs != null) {
    const d = body.durationMs;
    if (typeof d !== "number" || !Number.isFinite(d) || d < 0) {
      errors.push("durationMs must be a non-negative number");
    }
  }

  if ("startedAt" in body && body.startedAt != null) {
    if (!isIsoDateString(body.startedAt)) {
      errors.push("startedAt must be an ISO date string");
    }
  }

  if ("ts" in body && body.ts != null) {
    if (!isIsoDateString(body.ts)) {
      errors.push("ts must be an ISO date string");
    }
  }

  if ("meta" in body && body.meta != null && !isPlainObject(body.meta)) {
    errors.push("meta must be an object");
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`health-report:${ip}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(request, MAX_JSON_BYTES);

    const errors = validate(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const status = body.status as HealthEventStatus;

    const saved = await appendHealthEvent({
      ts: typeof body.ts === "string" ? body.ts : undefined,
      agentId: (body.agentId as string).trim(),
      agentType: typeof body.agentType === "string" ? body.agentType.trim() : undefined,
      runId: typeof body.runId === "string" ? body.runId.trim() : undefined,
      status,
      message: typeof body.message === "string" ? body.message : undefined,
      progress:
        typeof body.progress === "string" || typeof body.progress === "number" ? body.progress : undefined,
      durationMs: typeof body.durationMs === "number" ? body.durationMs : undefined,
      startedAt: typeof body.startedAt === "string" ? body.startedAt : undefined,
      meta: isPlainObject(body.meta) ? body.meta : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        event: saved,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: unknown }).status)
        : undefined;

    if (status === 413) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    console.error("/api/health/report error:", err);
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}

export async function GET() {
  const content = `# Agent Health Reporting (MVP)

## POST /api/health/report

Agents can self-report status events (append-only).

### Request body (JSON)

\`\`\`json
{
  "agentId": "agent:main",
  "agentType": "main" ,
  "runId": "run_123",
  "status": "heartbeat" | "error" | "completion",
  "message": "optional",
  "progress": "optional string" ,
  "durationMs": 12345,
  "startedAt": "2026-02-08T17:42:00.000Z",
  "meta": { "any": "json" }
}
\`\`\`

### Notes

- If no heartbeat is received for 15 minutes, the run is marked as potentially stuck.
- Runs with no events for >10 minutes are shown as stalled.
- Events are stored in \`data/health-events.json\` (last 1000 entries).
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
