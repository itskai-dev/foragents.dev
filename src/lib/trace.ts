export type TraceStatus = "success" | "error" | "running";

export type TraceStepType = "tool" | "llm" | "error" | "success";

export type TraceStepDetails = {
  input?: unknown;
  output?: unknown;
  error?: unknown;
};

export type TraceStep = {
  id: string;
  type: TraceStepType;
  name: string;
  description?: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationMs: number;
  details?: TraceStepDetails;
};

export type TraceRun = {
  id: string;
  title?: string;
  status: TraceStatus;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationMs: number;
  steps: TraceStep[];
};

export function clampNumber(n: unknown, fallback = 0): number {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

export function safeIsoString(s: unknown): string {
  return typeof s === "string" ? s : new Date(0).toISOString();
}

export function computeDurationMs(startedAtIso: string, endedAtIso: string): number {
  const start = new Date(startedAtIso).getTime();
  const end = new Date(endedAtIso).getTime();
  const ms = end - start;
  return Number.isFinite(ms) && ms >= 0 ? ms : 0;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

export function getStepIcon(type: TraceStepType): string {
  switch (type) {
    case "tool":
      return "🔧";
    case "llm":
      return "💬";
    case "error":
      return "❌";
    case "success":
      return "✅";
    default:
      return "•";
  }
}
