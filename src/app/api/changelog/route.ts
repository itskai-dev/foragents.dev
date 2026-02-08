import { NextRequest, NextResponse } from "next/server";
import { getChangelogEntries, isChangelogCategory } from "@/lib/changelog";

/**
 * GET /api/changelog?limit=50&category=feature|improvement|fix
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limitRaw = searchParams.get("limit");
  const categoryRaw = searchParams.get("category");

  const limit = Math.min(200, Math.max(1, Number(limitRaw) || 50));

  const all = await getChangelogEntries();

  const filtered =
    typeof categoryRaw === "string" && categoryRaw.trim().length > 0
      ? isChangelogCategory(categoryRaw)
        ? all.filter((e) => e.category === categoryRaw)
        : []
      : all;

  const items = filtered.slice(0, limit);

  return NextResponse.json(
    {
      items,
      count: items.length,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
