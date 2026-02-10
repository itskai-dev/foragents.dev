import { NextRequest, NextResponse } from "next/server";
import { BADGE_CATEGORIES, readBadgeStore } from "@/lib/server/badgeAwardsStore";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category")?.trim().toLowerCase() ?? "";
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";

  if (category && !BADGE_CATEGORIES.includes(category as (typeof BADGE_CATEGORIES)[number])) {
    return NextResponse.json(
      { error: "Invalid category", allowed: BADGE_CATEGORIES },
      { status: 400 }
    );
  }

  const allBadges = await readBadgeStore();

  const filtered = allBadges.filter((badge) => {
    if (category && badge.category !== category) {
      return false;
    }

    if (search) {
      const haystack = `${badge.name} ${badge.description} ${badge.criteria} ${badge.category}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    return true;
  });

  return NextResponse.json(
    {
      badges: filtered.map((badge) => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        emoji: badge.emoji,
        category: badge.category,
        criteria: badge.criteria,
        earnerCount: badge.earnerCount,
      })),
      total: filtered.length,
      categories: BADGE_CATEGORIES,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
