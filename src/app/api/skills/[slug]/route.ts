import { NextResponse } from "next/server";
import { getSkillBySlug } from "@/lib/data";
import { getSkillReviews } from "@/lib/reviews";
import versionsData from "@/data/skill-versions.json";
import compatibilityData from "@/data/compatibility.json";
import { getSkillInstalls } from "@/lib/server/skillInstalls";

type SkillVersionEntry = {
  slug: string;
  versions: Array<{
    version: string;
    date: string;
    changes: string[];
    type: string;
  }>;
};

type CompatibilityRecord = {
  worksWell: string[];
  conflicts: string[];
  untested: string[];
};

const FALLBACK_COMPATIBILITY: CompatibilityRecord = {
  worksWell: [],
  conflicts: [],
  untested: [],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const reviews = await getSkillReviews(slug, { sort: "newest" });
  const reviewsCount = reviews.length;
  const averageRating =
    reviewsCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewsCount
      : 0;

  const allVersions = versionsData as SkillVersionEntry[];
  const versions = allVersions.find((entry) => entry.slug === slug)?.versions ?? [];

  const compatibility =
    (compatibilityData as Record<string, CompatibilityRecord>)[slug] ??
    FALLBACK_COMPATIBILITY;

  const installs = await getSkillInstalls(slug);

  return NextResponse.json(
    {
      ...skill,
      installs,
      metadata: {
        reviews_count: reviewsCount,
        average_rating: Number(averageRating.toFixed(2)),
        latest_version: versions[0]?.version ?? null,
      },
      reviews,
      compatibility,
      versions,
    },
    {
      headers: { "Cache-Control": "public, max-age=300" },
    }
  );
}
