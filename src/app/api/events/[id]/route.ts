import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/requestLimits";
import { readEventsFile, toPublicEvent, writeEventsFile } from "@/lib/eventsStore";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8_000;

type RsvpInput = {
  agentHandle: string;
};

function validateRsvpPayload(
  body: Record<string, unknown>
): { ok: true; value: RsvpInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  const agentHandleRaw =
    typeof body.agentHandle === "string" ? body.agentHandle.trim().toLowerCase() : "";

  if (!agentHandleRaw) {
    errors.push("agentHandle is required");
  }

  if (agentHandleRaw.length > 50) {
    errors.push("agentHandle must be 50 characters or fewer");
  }

  if (!/^[a-z0-9._-]+$/.test(agentHandleRaw)) {
    errors.push("agentHandle may only contain lowercase letters, numbers, dots, underscores, and hyphens");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      agentHandle: agentHandleRaw,
    },
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`events-id:get:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const { id } = await context.params;
  const events = await readEventsFile();
  const event = events.find((entry) => entry.id === id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(toPublicEvent(event), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`events-id:post:${ip}`, { windowMs: 60_000, max: 50 });
  if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

  const { id } = await context.params;

  try {
    const body = await readJsonWithLimit(request, MAX_BODY_BYTES);
    const validation = validateRsvpPayload(body);

    if (!validation.ok) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const events = await readEventsFile();
    const eventIndex = events.findIndex((entry) => entry.id === id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = events[eventIndex];
    const handle = validation.value.agentHandle;

    if (event.rsvps.includes(handle)) {
      return NextResponse.json(
        {
          event: toPublicEvent(event),
          status: "already_rsvped",
        },
        { status: 200 }
      );
    }

    if (event.attendeeCount >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is at capacity" }, { status: 409 });
    }

    const updatedEvent = {
      ...event,
      rsvps: [...event.rsvps, handle],
      attendeeCount: Math.min(event.maxAttendees, event.attendeeCount + 1),
    };

    events[eventIndex] = updatedEvent;
    await writeEventsFile(events);

    return NextResponse.json(
      {
        event: toPublicEvent(updatedEvent),
        status: "rsvped",
      },
      { status: 200 }
    );
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
