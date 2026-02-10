import { NextRequest, NextResponse } from "next/server";
import {
  findBadgeById,
  readBadgeStore,
  sanitizeAgentHandle,
  writeBadgeStore,
} from "@/lib/server/badgeAwardsStore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const badges = await readBadgeStore();
  const badge = findBadgeById(badges, id);

  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      badge,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = (await request.json()) as { agentHandle?: unknown };
    const agentHandle = sanitizeAgentHandle(body.agentHandle);

    if (!agentHandle) {
      return NextResponse.json(
        { error: "agentHandle is required." },
        { status: 400 }
      );
    }

    const badges = await readBadgeStore();
    const badgeIndex = badges.findIndex((badge) => badge.id === id);

    if (badgeIndex === -1) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    }

    const badge = badges[badgeIndex]!;
    const alreadyEarned = badge.earners.includes(agentHandle);

    if (!alreadyEarned) {
      badge.earners = [...badge.earners, agentHandle];
      badge.earnerCount = badge.earnerCount + 1;
      badges[badgeIndex] = badge;
      await writeBadgeStore(badges);
    }

    return NextResponse.json({
      success: true,
      alreadyEarned,
      badge,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON." },
      { status: 400 }
    );
  }
}
