import { NextRequest, NextResponse } from "next/server";

import { filterGuides, readGuides, toGuideSummary } from "@/lib/guides";

export async function GET(request: NextRequest) {
  const difficulty = request.nextUrl.searchParams.get("difficulty") ?? undefined;
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;

  const guides = await readGuides();
  const filtered = filterGuides(guides, { difficulty, category, search });

  return NextResponse.json(
    {
      guides: filtered.map(toGuideSummary),
      total: filtered.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
