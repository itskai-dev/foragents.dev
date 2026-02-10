import { NextRequest, NextResponse } from "next/server";
import { getSkills } from "@/lib/data";
import { getComputedTrendingSkills } from "@/lib/server/trendingCatalog";

function parseIntParam(
  value: string | null,
  fallback: number,
  options?: { min?: number; max?: number }
): number {
  if (value === null) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;

  const min = options?.min ?? Number.NEGATIVE_INFINITY;
  const max = options?.max ?? Number.POSITIVE_INFINITY;

  return Math.min(max, Math.max(min, parsed));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category")?.trim().toLowerCase();

  let skills = getSkills();

  if (category) {
    skills = skills.filter((skill) =>
      skill.tags.some((tag) => tag.toLowerCase() === category)
    );
  }

  const ranked = await getComputedTrendingSkills(skills);
  const total = ranked.length;
  const limit = parseIntParam(searchParams.get("limit"), total || 1, {
    min: 1,
    max: 100,
  });

  const paginated = ranked.slice(0, limit);

  return NextResponse.json(
    {
      skills: paginated.map((skill) => ({
        ...skill,
        trendingBadge: skill.badge,
      })),
      total,
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
