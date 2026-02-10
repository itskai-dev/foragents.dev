import "server-only";

import type { Skill } from "@/lib/data";
import type { SkillReview } from "@/lib/reviews";
import type { TrendingBadgeKind } from "@/lib/trendingTypes";
import { readSkillInstallCounts } from "@/lib/server/skillInstalls";
import { getAllReviews } from "@/lib/reviews";

export type TrendingSkill = Skill & {
  trendingScore: number;
  badge: TrendingBadgeKind | null;
  installs: number;
  reviews: number;
  avgRating: number | null;
};

function assignBadges(
  sorted: Array<{ slug: string }>
): Record<string, TrendingBadgeKind | null> {
  const n = sorted.length;
  const badges: Record<string, TrendingBadgeKind | null> = {};
  if (n === 0) return badges;

  const hot = Math.max(1, Math.ceil(n * 0.05));
  const rising = Math.max(hot, Math.ceil(n * 0.15));
  const popular = Math.max(rising, Math.ceil(n * 0.3));

  sorted.forEach((s, idx) => {
    const rank = idx + 1;
    if (rank <= hot) badges[s.slug] = "hot";
    else if (rank <= rising) badges[s.slug] = "rising";
    else if (rank <= popular) badges[s.slug] = "popular";
    else badges[s.slug] = null;
  });

  return badges;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeByMax(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(max) || max <= 0) return 0;
  return clamp(value / max);
}

function indexReviewsBySkill(reviews: SkillReview[]): Map<string, SkillReview[]> {
  const map = new Map<string, SkillReview[]>();
  for (const review of reviews) {
    if (!review.skillSlug) continue;
    const rows = map.get(review.skillSlug) ?? [];
    rows.push(review);
    map.set(review.skillSlug, rows);
  }
  return map;
}

export async function getComputedTrendingSkills(skills: Skill[]): Promise<TrendingSkill[]> {
  const [installsBySlug, allReviews] = await Promise.all([
    readSkillInstallCounts(),
    getAllReviews(),
  ]);

  const reviewsBySlug = indexReviewsBySkill(allReviews);

  const maxInstalls = Math.max(0, ...Object.values(installsBySlug));
  const maxReviews = Math.max(
    0,
    ...Array.from(reviewsBySlug.values()).map((rows) => rows.length)
  );

  const newestIndexBySlug = new Map<string, number>();
  skills.forEach((skill, idx) => newestIndexBySlug.set(skill.slug, idx));
  const lastIndex = Math.max(1, skills.length - 1);

  const scored = skills.map((skill) => {
    const installs = Math.max(0, installsBySlug[skill.slug] ?? 0);
    const skillReviews = reviewsBySlug.get(skill.slug) ?? [];
    const reviews = skillReviews.length;
    const avgRating =
      reviews > 0
        ? skillReviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) /
          reviews
        : null;

    const installSignal = normalizeByMax(Math.log1p(installs), Math.log1p(maxInstalls));
    const reviewVolumeSignal = normalizeByMax(
      Math.log1p(reviews),
      Math.log1p(maxReviews)
    );
    const ratingSignal = avgRating === null ? 0 : clamp(avgRating / 5);

    // skills.json is append-only in practice, so newer entries have higher index.
    const creationRecency = normalizeByMax(
      newestIndexBySlug.get(skill.slug) ?? 0,
      lastIndex
    );

    const trendingScore =
      installSignal * 0.45 +
      reviewVolumeSignal * 0.3 +
      ratingSignal * 0.15 +
      creationRecency * 0.1;

    return {
      ...skill,
      trendingScore: Number(trendingScore.toFixed(4)),
      badge: null as TrendingBadgeKind | null,
      installs,
      reviews,
      avgRating: avgRating === null ? null : Number(avgRating.toFixed(2)),
    };
  });

  scored.sort((a, b) => b.trendingScore - a.trendingScore);

  const badges = assignBadges(scored.map((skill) => ({ slug: skill.slug })));
  for (const skill of scored) {
    skill.badge = badges[skill.slug] ?? null;
  }

  return scored;
}
