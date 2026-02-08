import { NextResponse } from "next/server";
import { getSkills } from "@/lib/data";
import { getTrendingSkillsWithBadges } from "@/lib/server/trendingSkills";

export async function GET() {
  const skills = getSkills();
  const ranked = await getTrendingSkillsWithBadges(skills);

  return NextResponse.json(
    {
      updated_at: new Date().toISOString(),
      skills: ranked.map((s) => ({
        slug: s.slug,
        trendingScore: s.trendingScore,
        trendingBadge: s.trendingBadge,
      })),
      count: ranked.length,
    },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
