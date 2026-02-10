import { promises as fs } from "fs";
import path from "path";

export type EventType = "workshop" | "meetup" | "hackathon" | "webinar" | "launch";

export type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  url?: string;
  location?: string;
  attendeeCount: number;
  maxAttendees: number;
  rsvps: string[];
  createdAt: string;
};

export type PublicCommunityEvent = Omit<CommunityEvent, "rsvps">;

type RawEvent = Partial<CommunityEvent> & Record<string, unknown>;

const EVENTS_PATH = path.join(process.cwd(), "data", "events.json");

export function getEventsPath() {
  return EVENTS_PATH;
}

export function isEventType(value: unknown): value is EventType {
  return (
    value === "workshop" ||
    value === "meetup" ||
    value === "hackathon" ||
    value === "webinar" ||
    value === "launch"
  );
}

function normalizeRsvpList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  const deduped = new Set<string>();
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const handle = entry.trim().toLowerCase();
    if (!handle) continue;
    deduped.add(handle);
  }

  return Array.from(deduped);
}

function normalizeEvent(raw: RawEvent): CommunityEvent | null {
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const type = raw.type;
  const date = typeof raw.date === "string" ? raw.date : "";
  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : "";

  if (!id || !title || !description || !isEventType(type)) return null;
  if (!date || Number.isNaN(Date.parse(date))) return null;

  const maxAttendeesRaw = typeof raw.maxAttendees === "number" ? raw.maxAttendees : 100;
  const maxAttendees = Number.isFinite(maxAttendeesRaw)
    ? Math.max(1, Math.floor(maxAttendeesRaw))
    : 100;

  const rsvps = normalizeRsvpList(raw.rsvps);

  const attendeeCountRaw = typeof raw.attendeeCount === "number" ? raw.attendeeCount : rsvps.length;
  const attendeeCount = Number.isFinite(attendeeCountRaw)
    ? Math.max(0, Math.min(maxAttendees, Math.floor(attendeeCountRaw)))
    : Math.min(maxAttendees, rsvps.length);

  const normalized: CommunityEvent = {
    id,
    title,
    description,
    type,
    date: new Date(date).toISOString(),
    attendeeCount,
    maxAttendees,
    rsvps,
    createdAt:
      createdAt && !Number.isNaN(Date.parse(createdAt))
        ? new Date(createdAt).toISOString()
        : new Date(0).toISOString(),
  };

  if (typeof raw.url === "string" && raw.url.trim()) {
    normalized.url = raw.url.trim();
  }

  if (typeof raw.location === "string" && raw.location.trim()) {
    normalized.location = raw.location.trim();
  }

  return normalized;
}

export function toPublicEvent(event: CommunityEvent): PublicCommunityEvent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { rsvps, ...publicEvent } = event;
  return publicEvent;
}

export async function readEventsFile(): Promise<CommunityEvent[]> {
  try {
    const raw = await fs.readFile(EVENTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((row) => normalizeEvent((row ?? {}) as RawEvent))
      .filter((row): row is CommunityEvent => Boolean(row));
  } catch {
    return [];
  }
}

export async function writeEventsFile(events: CommunityEvent[]) {
  const dir = path.dirname(EVENTS_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmp = `${EVENTS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(events, null, 2), "utf-8");
  await fs.rename(tmp, EVENTS_PATH);
}

export function sortEventsByDate(events: CommunityEvent[]) {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function makeEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
