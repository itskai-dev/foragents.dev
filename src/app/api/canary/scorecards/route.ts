import { NextResponse } from "next/server";

import { parseCompareIdsParam } from "@/lib/compare";
import {
  aggregateScorecards,
  readCanaryScorecards,
} from "@/lib/server/canaryScorecardStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const skillsParam = searchParams.get("skills");
  const slugs = parseCompareIdsParam(skillsParam);

  const allScorecards = await readCanaryScorecards();

  const scorecards: Record<string, ReturnType<typeof aggregateScorecards>> = {};

  for (const slug of slugs) {
    const latestDateForSkill = allScorecards
      .filter((s) => s.agentId === slug)
      .reduce<string | null>((max, s) => (max && max > s.date ? max : s.date), null);

    scorecards[slug] = latestDateForSkill
      ? aggregateScorecards(slug, allScorecards, latestDateForSkill, latestDateForSkill)
      : null;
  }

  return NextResponse.json(
    {
      updated_at: new Date().toISOString(),
      scorecards,
      count: slugs.length,
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
