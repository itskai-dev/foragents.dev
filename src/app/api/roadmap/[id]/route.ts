import { NextRequest, NextResponse } from "next/server";
import { readRoadmapItems, writeRoadmapItems } from "@/lib/server/roadmapStore";

type VoteRequest = {
  agentHandle?: unknown;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as VoteRequest;
    const agentHandle = typeof body.agentHandle === "string" ? body.agentHandle.trim() : "";

    if (!agentHandle) {
      return NextResponse.json({ error: "agentHandle is required" }, { status: 400 });
    }

    const items = await readRoadmapItems();
    const itemIndex = items.findIndex((item) => item.id === id);

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
    console.error("Failed to submit roadmap vote", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
