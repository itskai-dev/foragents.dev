import { promises as fs } from "fs";
import path from "path";
import type { TraceRun, TraceStep, TraceStatus, TraceStepType } from "@/lib/trace";
import { clampNumber, computeDurationMs, safeIsoString } from "@/lib/trace";

const TRACES_PATH = path.join(process.cwd(), "data", "traces.json");

type TraceFile = { traces: unknown };

function isTraceStatus(v: unknown): v is TraceStatus {
  return v === "success" || v === "error" || v === "running";
}

function isStepType(v: unknown): v is TraceStepType {
  return v === "tool" || v === "llm" || v === "error" || v === "success";
}

function normalizeStep(raw: unknown): TraceStep | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === "string" ? obj.id : "";
  const type = isStepType(obj.type) ? obj.type : null;
  const name = typeof obj.name === "string" ? obj.name : "";
  const description = typeof obj.description === "string" ? obj.description : undefined;
  const startedAt = safeIsoString(obj.startedAt);
  const endedAt = safeIsoString(obj.endedAt);

  if (!id || !type || !name) return null;

  const durationMs = clampNumber(obj.durationMs, computeDurationMs(startedAt, endedAt));

  const details = obj.details && typeof obj.details === "object" ? (obj.details as any) : undefined;

  return {
    id,
    type,
    name,
    ...(description ? { description } : {}),
    startedAt,
    endedAt,
    durationMs,
    ...(details ? { details } : {}),
  };
}

function normalizeTrace(raw: unknown): TraceRun | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === "string" ? obj.id : "";
  if (!id) return null;

  const title = typeof obj.title === "string" ? obj.title : undefined;
  const status: TraceStatus = isTraceStatus(obj.status) ? obj.status : "running";

  const startedAt = safeIsoString(obj.startedAt);
  const endedAt = safeIsoString(obj.endedAt);

  const stepsRaw = Array.isArray(obj.steps) ? obj.steps : [];
  const steps = stepsRaw.map(normalizeStep).filter(Boolean) as TraceStep[];

  const durationMs = clampNumber(obj.durationMs, computeDurationMs(startedAt, endedAt));

  return {
    id,
    ...(title ? { title } : {}),
    status,
    startedAt,
    endedAt,
    durationMs,
    steps,
  };
}

export async function readTracesFile(): Promise<TraceRun[]> {
  try {
    const raw = await fs.readFile(TRACES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    const tracesValue =
      parsed && typeof parsed === "object" && Array.isArray((parsed as TraceFile).traces)
        ? (parsed as TraceFile).traces
        : Array.isArray(parsed)
          ? parsed
          : [];

    const traces = (tracesValue as unknown[]).map(normalizeTrace).filter(Boolean) as TraceRun[];
    return traces;
  } catch {
    return [];
  }
}

export async function getTraceById(id: string): Promise<TraceRun | null> {
  const traces = await readTracesFile();
  return traces.find((t) => t.id === id) || null;
}
