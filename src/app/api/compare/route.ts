import { NextResponse } from "next/server";

import { parseCompareSkillsParam } from "@/lib/compare";
import { getSkillBySlug } from "@/lib/data";
import { getSkillInstalls } from "@/lib/server/skillInstalls";
import { getSkillRatingsSummary } from "@/lib/server/skillFeedback";
import { aggregateScorecards, readCanaryScorecards } from "@/lib/server/canaryScorecardStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skillsParam = searchParams.get("skills");
  const slugs = parseCompareSkillsParam(skillsParam).slice(0, 2);

  if (slugs.length < 2) {
    return NextResponse.json(
      {
        error: "Please provide exactly 2 skill slugs in ?skills=slug1,slug2",
      },
      { status: 400 }
    );
  }

  const allScorecards = await readCanaryScorecards();

  const skills = await Promise.all(
    slugs.map(async (slug) => {
      const skill = getSkillBySlug(slug);
      if (!skill) {
        return {
          slug,
          error: "Skill not found",
        };
      }

      const [installs, ratings] = await Promise.all([
        getSkillInstalls(slug),
        getSkillRatingsSummary({ artifact_slug: slug }),
      ]);

      const latestDateForSkill = allScorecards
        .filter((s) => s.agentId === slug)
        .reduce<string | null>((max, s) => (max && max > s.date ? max : s.date), null);

      const canary = latestDateForSkill
        ? aggregateScorecards(slug, allScorecards, latestDateForSkill, latestDateForSkill)
        : null;

      return {
        ...skill,
        installs,
        ratings,
        canary,
      };
    })
  );

  return NextResponse.json(
    {
      updated_at: new Date().toISOString(),
      slugs,
      skills,
    },
    {
      headers: { "Cache-Control": "public, max-age=60" },
    }
  );
}
