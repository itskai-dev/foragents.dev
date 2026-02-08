import "server-only";

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type RevenueEventType =
  | "checkout_started"
  | "webhook_received"
  | "webhook_processed"
  | "webhook_failed"
  | "entitlement_granted";

export type RevenueEvent = {
  id: string;
  type: RevenueEventType;
  created_at: string;
  meta?: Record<string, unknown> | null;
};

const DEFAULT_FILE_PATH = path.join(process.cwd(), "data", "revenue-events.json");
const MAX_EVENTS = 5000;

function getFilePath(): string {
  return process.env.REVENUE_EVENTS_FILE_PATH || DEFAULT_FILE_PATH;
}

function isValidEventType(x: unknown): x is RevenueEventType {
  return (
    x === "checkout_started" ||
    x === "webhook_received" ||
    x === "webhook_processed" ||
    x === "webhook_failed" ||
    x === "entitlement_granted"
  );
}

function coerceEvent(x: unknown): RevenueEvent | null {
  if (!x || typeof x !== "object") return null;
  const obj = x as Record<string, unknown>;

  const type = obj.type;
  const created_at = obj.created_at;
  const id = obj.id;

  if (!isValidEventType(type)) return null;
  if (typeof created_at !== "string") return null;
  if (typeof id !== "string") return null;

  const meta = obj.meta;
  return {
    id,
    type,
    created_at,
    meta: meta && typeof meta === "object" ? (meta as Record<string, unknown>) : null,
  };
}

async function readEventsFile(): Promise<RevenueEvent[]> {
  const filePath = getFilePath();
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(coerceEvent).filter((e): e is RevenueEvent => Boolean(e));
  } catch {
    return [];
  }
}

async function writeEventsFile(events: RevenueEvent[]): Promise<void> {
  const filePath = getFilePath();
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  const trimmed = events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(trimmed, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}

export function computeStripeEventLagSec(stripeEventCreatedUnixSec: unknown, nowMs?: number): number | null {
  const createdSec = typeof stripeEventCreatedUnixSec === "number" ? stripeEventCreatedUnixSec : Number.NaN;
  if (!Number.isFinite(createdSec) || createdSec <= 0) return null;
  const now = typeof nowMs === "number" ? nowMs : Date.now();
  const lagSec = (now - createdSec * 1000) / 1000;
  if (!Number.isFinite(lagSec)) return null;
  return Math.max(0, lagSec);
}

export async function logRevenueEvent(type: RevenueEventType, meta?: Record<string, unknown>): Promise<void> {
  const event: RevenueEvent = {
    id: crypto.randomUUID(),
    type,
    created_at: new Date().toISOString(),
    meta: meta ?? null,
  };

  try {
    const existing = await readEventsFile();
    existing.push(event);
    await writeEventsFile(existing);
  } catch (err) {
    // Metrics must never break revenue flows.
    console.warn("revenue-events log failed:", err);
  }
}

export async function listRevenueEvents(): Promise<RevenueEvent[]> {
  return await readEventsFile();
}

export function summarizeRevenueEvents(events: RevenueEvent[], opts?: { nowMs?: number }) {
  const nowMs = opts?.nowMs ?? Date.now();
  const oneHourAgoMs = nowMs - 60 * 60 * 1000;

  let lastWebhookReceivedAt: string | null = null;

  const lagSecValues: number[] = [];
  let failuresLastHour = 0;
  const recentFailures: RevenueEvent[] = [];

  for (const e of events) {
    if (e.type === "webhook_received") {
      if (!lastWebhookReceivedAt || e.created_at > lastWebhookReceivedAt) {
        lastWebhookReceivedAt = e.created_at;
      }
    }

    if (e.type === "webhook_processed") {
      const lag = (e.meta ?? {}).stripe_event_lag_sec;
      const lagNum = typeof lag === "number" ? lag : Number.NaN;
      if (Number.isFinite(lagNum)) lagSecValues.push(lagNum);
    }

    if (e.type === "webhook_failed") {
      const ts = new Date(e.created_at).getTime();
      if (Number.isFinite(ts) && ts >= oneHourAgoMs) {
        failuresLastHour++;
        recentFailures.push(e);
      }
    }
  }

  const avgStripeEventLagSec =
    lagSecValues.length > 0 ? lagSecValues.reduce((a, b) => a + b, 0) / lagSecValues.length : null;

  recentFailures.sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));

  return {
    lastWebhookReceivedAt,
    avgStripeEventLagSec,
    failuresLastHour,
    lastFailure: recentFailures[0] ?? null,
    totalEvents: events.length,
  };
}
