import { NextRequest, NextResponse } from "next/server";
import { getLeaderboardRankings } from "@/lib/server/leaderboard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") ?? undefined;
  const limitParam = searchParams.get("limit");
  const parsedLimit = limitParam ? Number(limitParam) : undefined;
  const limit = Number.isFinite(parsedLimit) && (parsedLimit ?? 0) > 0
    ? Math.min(Math.floor(parsedLimit as number), 100)
    : undefined;

  const data = await getLeaderboardRankings({ category, limit });
  return NextResponse.json(data);
}
