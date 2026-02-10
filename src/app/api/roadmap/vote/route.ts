import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/requestLimits";
import { readRoadmapItems, writeRoadmapItems } from "@/lib/server/roadmapStore";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { itemId?: unknown; agentHandle?: unknown };
    const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim() : "";

    if (!itemId || !agentHandle) {
      return NextResponse.json(
        { error: "itemId and agentHandle are required" },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const limited = checkRateLimit(`roadmap-vote:${ip}:${itemId}:${agentHandle.toLowerCase()}`, {
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

    const items = await readRoadmapItems();
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Roadmap item not found" }, { status: 404 });
    }

    const normalizedHandle = agentHandle.toLowerCase();
    const item = items[itemIndex];
    const hasVoted = item.voters.some((voter) => voter.toLowerCase() === normalizedHandle);

    if (hasVoted) {
      return NextResponse.json(
        { error: "You have already voted for this feature", item },
        { status: 409 }
      );
    }

    const updatedItem = {
      ...item,
      voteCount: item.voteCount + 1,
      voters: [...item.voters, agentHandle],
    };

    items[itemIndex] = updatedItem;
    await writeRoadmapItems(items);

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Failed to vote on roadmap item", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
