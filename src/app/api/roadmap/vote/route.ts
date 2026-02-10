import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/requestLimits";
import { incrementRoadmapVote } from "@/lib/server/roadmapStore";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { itemId?: unknown };
    const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const limited = checkRateLimit(`roadmap-vote:${ip}:${itemId}`, {
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: 1,
    });

    if (!limited.ok) {
      return NextResponse.json(
        { error: "Vote limit reached for this item. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limited.retryAfterSec),
          },
        }
      );
    }

    const vote = await incrementRoadmapVote(itemId);

    if (!vote) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Failed to vote on roadmap item", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
