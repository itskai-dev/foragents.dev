import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/requestLimits";
import {
  CommunityEvent,
  EventType,
  isEventType,
  makeEventId,
  readEventsFile,
  sortEventsByDate,
  toPublicEvent,
  writeEventsFile,
} from "@/lib/eventsStore";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 24_000;

type CreateEventInput = {
  title: string;
  description: string;
  type: EventType;
  date: string;
  url?: string;
  location?: string;
};

function validateEventPayload(
  body: Record<string, unknown>
): { ok: true; value: CreateEventInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const typeRaw = typeof body.type === "string" ? body.type.trim().toLowerCase() : "";
  const dateRaw = typeof body.date === "string" ? body.date.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";

  if (!title) errors.push("title is required");
  if (title.length > 120) errors.push("title must be under 120 characters");

  if (!description) errors.push("description is required");
  if (description.length > 2_000) errors.push("description must be under 2,000 characters");

  if (!isEventType(typeRaw)) {
    errors.push("type must be one of: workshop, meetup, hackathon, webinar, launch");
  }

  if (!dateRaw || Number.isNaN(Date.parse(dateRaw))) {
    errors.push("date must be a valid ISO date");
  }

  if (!url && !location) {
    errors.push("either location or url is required");
  }

  if (url) {
    if (url.length > 500) {
      errors.push("url must be under 500 characters");
    } else {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.push("url must use http or https");
        }
      } catch {
        errors.push("url must be a valid URL");
      }
    }
  }

  if (location.length > 120) {
    errors.push("location must be under 120 characters");
  }

  if (errors.length > 0 || !isEventType(typeRaw) || !dateRaw) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      description,
      type: typeRaw,
      date: new Date(dateRaw).toISOString(),
      ...(url ? { url } : {}),
      ...(location ? { location } : {}),
    },
  };
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`events:get:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const typeParam = request.nextUrl.searchParams.get("type")?.trim().toLowerCase();
  const upcomingParam = request.nextUrl.searchParams.get("upcoming");
  const upcomingOnly = upcomingParam === "true";

  const allEvents = await readEventsFile();

  const withTypeFilter = isEventType(typeParam)
    ? allEvents.filter((event) => event.type === typeParam)
    : allEvents;

  const now = Date.now();
  const filtered = upcomingOnly
    ? withTypeFilter.filter((event) => new Date(event.date).getTime() > now)
    : withTypeFilter;

  const sorted = sortEventsByDate(filtered);

  return NextResponse.json(
    {
      events: sorted.map(toPublicEvent),
      total: sorted.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`events:post:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  try {
    const body = await readJsonWithLimit(request, MAX_BODY_BYTES);
    const validation = validateEventPayload(body);

    if (!validation.ok) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const current = await readEventsFile();

    const newEvent: CommunityEvent = {
      id: makeEventId(),
      attendeeCount: 0,
      maxAttendees: 100,
      rsvps: [],
      createdAt: new Date().toISOString(),
      ...validation.value,
    };

    await writeEventsFile([...current, newEvent]);

    return NextResponse.json(toPublicEvent(newEvent), { status: 201 });
  } catch (err: unknown) {
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? ((err as { status: number }).status ?? 400)
        : 400;

    if (status === 413) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }
}
