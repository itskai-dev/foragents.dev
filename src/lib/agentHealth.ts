import { promises as fs } from "fs";
import path from "path";

export type HealthEventStatus = "heartbeat" | "error" | "completion";

export type HealthEvent = {
  id: string;
  ts: string; // ISO
  agentId: string;
  agentType?: string;
  runId?: string;
  status: HealthEventStatus;
  message?: string;
  progress?: string | number;
  // Optional: agents can include duration for completed runs
  durationMs?: number;
  // Optional: allow agents to send explicit start time
  startedAt?: string;
  // Extra JSON payload
  meta?: Record<string, unknown>;
};

const HEALTH_EVENTS_PATH = path.join(process.cwd(), "data", "health-events.json");
const MAX_EVENTS = 1000;

export function getHealthEventsPath() {
  return HEALTH_EVENTS_PATH;
}

function isIsoDateString(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const t = Date.parse(v);
  return Number.isFinite(t);
}

function toFiniteNumber(v: unknown): number | undefined {
  if (typeof v !== "number") return undefined;
  if (!Number.isFinite(v)) return undefined;
  return v;
}

export async function readHealthEvents(): Promise<HealthEvent[]> {
  try {
    const raw = await fs.readFile(HEALTH_EVENTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Best-effort validation/coercion (keep it permissive)
    const events: HealthEvent[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const e = item as Partial<HealthEvent>;
      if (typeof e.id !== "string") continue;
      if (!isIsoDateString(e.ts)) continue;
      if (typeof e.agentId !== "string" || e.agentId.trim().length === 0) continue;
      if (e.status !== "heartbeat" && e.status !== "error" && e.status !== "completion") continue;

      events.push({
        id: e.id,
        ts: e.ts,
        agentId: e.agentId,
        agentType: typeof e.agentType === "string" ? e.agentType : undefined,
        runId: typeof e.runId === "string" ? e.runId : undefined,
        status: e.status,
        message: typeof e.message === "string" ? e.message : undefined,
        progress:
          typeof e.progress === "string" || typeof e.progress === "number" ? e.progress : undefined,
        durationMs: toFiniteNumber(e.durationMs),
        startedAt: isIsoDateString(e.startedAt) ? e.startedAt : undefined,
        meta: e.meta && typeof e.meta === "object" ? (e.meta as Record<string, unknown>) : undefined,
      });
    }

    // Ensure chronological order (older -> newer)
    events.sort((a, b) => a.ts.localeCompare(b.ts));
    return events.slice(-MAX_EVENTS);
  } catch {
    return [];
  }
}

export async function appendHealthEvent(
  event: Omit<HealthEvent, "id" | "ts"> & { id?: string; ts?: string }
): Promise<HealthEvent> {
  const ts = event.ts && isIsoDateString(event.ts) ? event.ts : new Date().toISOString();
  const id = event.id ?? `he_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const next: HealthEvent = {
    id,
    ts,
    agentId: event.agentId,
    agentType: event.agentType,
    runId: event.runId,
    status: event.status,
    message: event.message,
    progress: event.progress,
    durationMs: event.durationMs,
    startedAt: event.startedAt,
    meta: event.meta,
  };

  const dir = path.dirname(HEALTH_EVENTS_PATH);
  await fs.mkdir(dir, { recursive: true });

  const current = await readHealthEvents();
  const updated = [...current, next].slice(-MAX_EVENTS);

  // Atomic-ish write.
  const tmp = `${HEALTH_EVENTS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(updated, null, 2), "utf-8");
  await fs.rename(tmp, HEALTH_EVENTS_PATH);

  return next;
}

export type AgentSessionSummary = {
  sessionKey: string;
  agentId: string;
  agentType: string;
  runId?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastStatus: HealthEventStatus;
  uptimeMs: number;
  sinceLastMs: number;
  message?: string;
};

export type AgentHealthMetrics = {
  status: "ok" | "degraded";
  generatedAt: string;
  windows: {
    stallMs: number; // >10 min without events
    stuckMs: number; // >15 min without heartbeat
    lookback24hMs: number;
  };
  totals: {
    events: number;
    sessionsObserved: number;
    activeSessions: number;
    stalledSessions: number;
    potentiallyStuckSessions: number;
    failures24h: number;
    completions24h: number;
  };
  activeSessions: AgentSessionSummary[];
  stalledOrStuckSessions: Array<AgentSessionSummary & { severity: "yellow" | "red" }>;
  recentFailures: Array<{
    ts: string;
    agentId: string;
    agentType: string;
    runId?: string;
    message?: string;
  }>;
  successRate24h: {
    success: number;
    error: number;
    total: number;
    rate: number | null;
  };
  averageRunDurationByAgentType: Array<{
    agentType: string;
    runs: number;
    avgDurationMs: number;
  }>;
};

function sessionKeyFor(e: Pick<HealthEvent, "agentId" | "runId">) {
  return `${e.agentId}:${e.runId ?? "default"}`;
}

function safeAgentType(v: unknown): string {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : "unknown";
}

export function computeAgentHealthMetrics(events: HealthEvent[], now = new Date()): AgentHealthMetrics {
  const nowMs = now.getTime();
  const stallMs = 10 * 60_000;
  const stuckMs = 15 * 60_000;
  const lookback24hMs = 24 * 60 * 60_000;
  const cutoff24h = nowMs - lookback24hMs;

  // Group by session
  const bySession = new Map<string, HealthEvent[]>();
  for (const e of events) {
    const key = sessionKeyFor(e);
    const list = bySession.get(key) ?? [];
    list.push(e);
    bySession.set(key, list);
  }

  const sessions: AgentSessionSummary[] = [];
  const stalledOrStuck: Array<AgentSessionSummary & { severity: "yellow" | "red" }> = [];

  for (const [key, list] of bySession.entries()) {
    list.sort((a, b) => a.ts.localeCompare(b.ts));
    const first = list[0];
    const last = list[list.length - 1];

    const firstSeenMs = Date.parse(first.ts);
    const lastSeenMs = Date.parse(last.ts);

    const summary: AgentSessionSummary = {
      sessionKey: key,
      agentId: last.agentId,
      agentType: safeAgentType(last.agentType ?? first.agentType),
      runId: last.runId,
      firstSeenAt: first.ts,
      lastSeenAt: last.ts,
      lastStatus: last.status,
      uptimeMs: Math.max(0, nowMs - firstSeenMs),
      sinceLastMs: Math.max(0, nowMs - lastSeenMs),
      message: last.message,
    };

    sessions.push(summary);

    const terminal = last.status === "completion" || last.status === "error";
    if (!terminal && summary.sinceLastMs > stallMs) {
      stalledOrStuck.push({
        ...summary,
        severity: summary.sinceLastMs > stuckMs ? "red" : "yellow",
      });
    }
  }

  const activeSessions = sessions
    .filter((s) => {
      if (s.lastStatus !== "heartbeat") return false;
      if (s.sinceLastMs > stuckMs) return false;
      return true;
    })
    .sort((a, b) => a.sinceLastMs - b.sinceLastMs);

  const failures24h = events.filter((e) => e.status === "error" && Date.parse(e.ts) >= cutoff24h);
  const completions24h = events.filter(
    (e) => e.status === "completion" && Date.parse(e.ts) >= cutoff24h
  );

  const terminal24h = events.filter((e) => {
    if (e.status !== "error" && e.status !== "completion") return false;
    return Date.parse(e.ts) >= cutoff24h;
  });

  const success = terminal24h.filter((e) => e.status === "completion").length;
  const error = terminal24h.filter((e) => e.status === "error").length;
  const total = success + error;

  // Duration by agent type (from completion events in last 24h)
  const durationsByType = new Map<string, number[]>();
  const eventsBySession = bySession;

  for (const e of completions24h) {
    const agentType = safeAgentType(e.agentType);
    let durationMs: number | undefined =
      typeof e.durationMs === "number" && Number.isFinite(e.durationMs) && e.durationMs >= 0
        ? e.durationMs
        : undefined;

    if (durationMs == null) {
      const endMs = Date.parse(e.ts);
      let startMs: number | undefined;

      if (e.startedAt && isIsoDateString(e.startedAt)) {
        startMs = Date.parse(e.startedAt);
      } else {
        const key = sessionKeyFor(e);
        const list = eventsBySession.get(key) ?? [];
        // Find the earliest event within 7 days before completion.
        const sevenDaysMs = 7 * 24 * 60 * 60_000;
        const earliest = list.find((x) => {
          const t = Date.parse(x.ts);
          return t <= endMs && endMs - t <= sevenDaysMs;
        });
        if (earliest) startMs = Date.parse(earliest.ts);
      }

      if (startMs != null && Number.isFinite(startMs) && startMs <= endMs) {
        durationMs = endMs - startMs;
      }
    }

    if (durationMs == null || !Number.isFinite(durationMs) || durationMs < 0) continue;

    const arr = durationsByType.get(agentType) ?? [];
    arr.push(durationMs);
    durationsByType.set(agentType, arr);
  }

  const averageRunDurationByAgentType = [...durationsByType.entries()]
    .map(([agentType, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / Math.max(1, durations.length);
      return {
        agentType,
        runs: durations.length,
        avgDurationMs: Math.round(avg),
      };
    })
    .sort((a, b) => b.runs - a.runs || a.agentType.localeCompare(b.agentType));

  // Recent failures/stuck, sorted newest first
  stalledOrStuck.sort((a, b) => b.sinceLastMs - a.sinceLastMs);

  const recentFailures = failures24h
    .slice()
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .slice(0, 25)
    .map((e) => ({
      ts: e.ts,
      agentId: e.agentId,
      agentType: safeAgentType(e.agentType),
      runId: e.runId,
      message: e.message,
    }));

  const degraded = stalledOrStuck.some((s) => s.severity === "red") || recentFailures.length > 0;

  return {
    status: degraded ? "degraded" : "ok",
    generatedAt: new Date(nowMs).toISOString(),
    windows: {
      stallMs,
      stuckMs,
      lookback24hMs,
    },
    totals: {
      events: events.length,
      sessionsObserved: sessions.length,
      activeSessions: activeSessions.length,
      stalledSessions: stalledOrStuck.filter((s) => s.severity === "yellow").length,
      potentiallyStuckSessions: stalledOrStuck.filter((s) => s.severity === "red").length,
      failures24h: failures24h.length,
      completions24h: completions24h.length,
    },
    activeSessions,
    stalledOrStuckSessions: stalledOrStuck,
    recentFailures,
    successRate24h: {
      success,
      error,
      total,
      rate: total > 0 ? success / total : null,
    },
    averageRunDurationByAgentType,
  };
}
