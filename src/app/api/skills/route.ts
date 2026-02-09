import { NextRequest, NextResponse } from "next/server";
import { getSkills } from "@/lib/data";
import { getTrendingSkillsWithBadges } from "@/lib/server/trendingSkills";

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
  const search = searchParams.get("search")?.trim().toLowerCase();
  const sort = searchParams.get("sort")?.trim().toLowerCase();

  let skills = getSkills();

  if (category) {
    skills = skills.filter((skill) =>
      skill.tags.some((tag) => tag.toLowerCase() === category)
    );
  }

  if (search) {
    skills = skills.filter((skill) => {
      const haystack = `${skill.name} ${skill.description}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  if (sort === "trending") {
    skills = await getTrendingSkillsWithBadges(skills);
  }

  const total = skills.length;
  const limit = parseIntParam(searchParams.get("limit"), total || 1, {
    min: 1,
    max: 100,
  });
  const offset = parseIntParam(searchParams.get("offset"), 0, { min: 0 });
  const page = Math.floor(offset / limit) + 1;

  const paginated = skills.slice(offset, offset + limit);

  return NextResponse.json(
    {
      skills: paginated,
      total,
      page,
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
