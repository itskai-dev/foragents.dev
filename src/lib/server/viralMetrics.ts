import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

export type ViralMetricEventType =
  | "artifact_created"
  | "artifact_viewed"
  | "artifact_share_copied"
  | "artifact_remixed"
  | "comment_created"
  | "rating_created_or_updated";

export type ViralMetricEvent = {
  id?: string;
  type: ViralMetricEventType;
  created_at: string;
  artifact_id?: string | null;
  meta?: Record<string, unknown> | null;
};

export const VIRAL_EVENT_TYPES: ViralMetricEventType[] = [
  "artifact_created",
  "artifact_viewed",
  "artifact_share_copied",
  "artifact_remixed",
  "comment_created",
  "rating_created_or_updated",
];

const DEFAULT_FILE_PATH = path.join(process.cwd(), "data", "viral_events.ndjson");

function getFilePath(): string {
  return process.env.VIRAL_METRICS_FILE_PATH || DEFAULT_FILE_PATH;
}

function isMissingTable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  return code === "PGRST205";
}

export function parseWindowMs(windowParam: string | null | undefined): { windowMs: number; windowLabel: string } {
  const raw = (windowParam ?? "").trim();
  if (!raw) return { windowMs: 72 * 60 * 60 * 1000, windowLabel: "72h" };

  const m = raw.match(/^(\d+)(m|h|d)$/i);
  if (!m) return { windowMs: 72 * 60 * 60 * 1000, windowLabel: "72h" };

  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (!Number.isFinite(n) || n <= 0) return { windowMs: 72 * 60 * 60 * 1000, windowLabel: "72h" };

  const mult = unit === "m" ? 60 * 1000 : unit === "h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const windowMs = n * mult;

  // Clamp to a reasonable max window for safety.
  const maxMs = 30 * 24 * 60 * 60 * 1000;
  const clamped = Math.min(windowMs, maxMs);
  return { windowMs: clamped, windowLabel: raw };
}

async function appendEventToFile(event: ViralMetricEvent): Promise<void> {
  const filePath = getFilePath();
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(event)}\n`, "utf-8");
}

async function readEventsFromFile(startIso: string): Promise<ViralMetricEvent[]> {
  const filePath = getFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const startTs = new Date(startIso).getTime();
    const lines = raw.split(/\n+/g).filter(Boolean);
    const out: ViralMetricEvent[] = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line) as ViralMetricEvent;
        if (!parsed || typeof parsed !== "object") continue;
        if (typeof parsed.created_at !== "string" || typeof parsed.type !== "string") continue;
        const ts = new Date(parsed.created_at).getTime();
        if (!Number.isFinite(ts) || ts < startTs) continue;
        if (!VIRAL_EVENT_TYPES.includes(parsed.type as ViralMetricEventType)) continue;
        out.push({
          type: parsed.type as ViralMetricEventType,
          created_at: parsed.created_at,
          artifact_id: typeof parsed.artifact_id === "string" ? parsed.artifact_id : null,
          meta: parsed.meta && typeof parsed.meta === "object" ? parsed.meta : null,
        });
      } catch {
        // ignore malformed lines
      }
    }

    return out;
  } catch {
    return [];
  }
}

export async function logViralEvent(
  type: ViralMetricEventType,
  params?: { artifact_id?: string | null; meta?: Record<string, unknown> }
): Promise<void> {
  const created_at = new Date().toISOString();
  const event: ViralMetricEvent = {
    type,
    created_at,
    artifact_id: params?.artifact_id ?? null,
    meta: params?.meta ?? null,
  };

  // Supabase-first if configured and table exists.
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("viral_events").insert({
        type: event.type,
        created_at: event.created_at,
        artifact_id: event.artifact_id,
        meta: event.meta,
      });

      if (!error) return;
      if (!isMissingTable(error)) {
        // Non-fatal: fallback.
        console.warn("viral_events insert failed; falling back to file:", error);
      }
    }
  } catch (err) {
    // ignore; fallback to file
    console.warn("viral_events insert exception; falling back to file:", err);
  }

  try {
    await appendEventToFile(event);
  } catch (err) {
    // Last resort: swallow. Metrics must never break core flows.
    console.warn("viral_events file append failed:", err);
  }
}

export async function listViralEventsInWindow(params: { startIso: string }): Promise<ViralMetricEvent[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("viral_events")
        .select("type, created_at, artifact_id, meta")
        .gte("created_at", params.startIso)
        .order("created_at", { ascending: true })
        .limit(10000);

      if (!error) {
        return (data ?? [])
          .map((d) => ({
            type: d.type as ViralMetricEventType,
            created_at: d.created_at as string,
            artifact_id: (d.artifact_id as string | null) ?? null,
            meta: (d.meta as Record<string, unknown> | null) ?? null,
          }))
          .filter((e) => VIRAL_EVENT_TYPES.includes(e.type));
      }

      if (!isMissingTable(error)) {
        console.warn("viral_events select failed; falling back to file:", error);
      }
    } catch (err) {
      console.warn("viral_events select exception; falling back to file:", err);
    }
  }

  return await readEventsFromFile(params.startIso);
}

export function summarizeViralEvents(events: ViralMetricEvent[]) {
  const counts: Record<ViralMetricEventType, number> = {
    artifact_created: 0,
    artifact_viewed: 0,
    artifact_share_copied: 0,
    artifact_remixed: 0,
    comment_created: 0,
    rating_created_or_updated: 0,
  };

  for (const e of events) {
    if (counts[e.type] !== undefined) counts[e.type]++;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return { total, counts };
}

export function summarizeArtifacts(events: ViralMetricEvent[]) {
  const byArtifact = new Map<
    string,
    {
      artifact_id: string;
      counts: Record<ViralMetricEventType, number>;
    }
  >();

  for (const e of events) {
    const artifactId = e.artifact_id;
    if (!artifactId) continue;
    const cur = byArtifact.get(artifactId) ?? {
      artifact_id: artifactId,
      counts: {
        artifact_created: 0,
        artifact_viewed: 0,
        artifact_share_copied: 0,
        artifact_remixed: 0,
        comment_created: 0,
        rating_created_or_updated: 0,
      },
    };
    if (cur.counts[e.type] !== undefined) cur.counts[e.type]++;
    byArtifact.set(artifactId, cur);
  }

  const items = Array.from(byArtifact.values()).map((x) => {
    // Simple, deterministic weighting. Tunable later.
    const score =
      x.counts.artifact_viewed +
      3 * x.counts.artifact_share_copied +
      4 * x.counts.artifact_remixed +
      5 * x.counts.comment_created +
      2 * x.counts.rating_created_or_updated;

    return {
      artifact_id: x.artifact_id,
      score,
      counts: x.counts,
    };
  });

  items.sort((a, b) => b.score - a.score || a.artifact_id.localeCompare(b.artifact_id));
  return items;
}
