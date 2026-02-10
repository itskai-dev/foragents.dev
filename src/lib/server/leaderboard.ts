import "server-only";

import { getSkills } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";
import { readSkillInstallCounts } from "@/lib/server/skillInstalls";
import { readCanaryScorecards } from "@/lib/server/canaryScorecardStore";

export type LeaderboardRow = {
  rank: number;
  slug: string;
  name: string;
  score: number;
  installs: number;
  reviews: number;
  avgRating: number;
};

export type LeaderboardResult = {
  rankings: LeaderboardRow[];
  total: number;
};

export async function getLeaderboardRankings(opts?: {
  category?: string;
  limit?: number;
}): Promise<LeaderboardResult> {
  const skills = getSkills();
  const installs = await readSkillInstallCounts();
  const reviews = await getAllReviews();
  const canaryScorecards = await readCanaryScorecards();

  const normalizedCategory = opts?.category?.trim().toLowerCase() ?? "";

  const reviewStats = new Map<string, { count: number; sum: number }>();
  for (const review of reviews) {
    const slug = review.skillSlug;
    const rating = Number(review.rating) || 0;
    const current = reviewStats.get(slug) ?? { count: 0, sum: 0 };
    current.count += 1;
    current.sum += rating;
    reviewStats.set(slug, current);
  }

  const canarySlugs = new Set(canaryScorecards.map((scorecard) => scorecard.agentId));

  const filtered = (normalizedCategory
    ? skills.filter((skill) => skill.tags.some((tag) => tag.toLowerCase() === normalizedCategory))
    : skills).filter((skill) => canarySlugs.has(skill.slug));

  const ranked = filtered
    .map((skill) => {
      const installCount = installs[skill.slug] ?? 0;
      const review = reviewStats.get(skill.slug) ?? { count: 0, sum: 0 };
      const avgRating = review.count > 0 ? review.sum / review.count : 0;
      const rawScore = installCount * 2 + review.count * 3 + avgRating * 10;
      const score = Number(rawScore.toFixed(2));

      return {
        slug: skill.slug,
        name: skill.name,
        score,
        installs: installCount,
        reviews: review.count,
        avgRating: Number(avgRating.toFixed(2)),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.installs !== a.installs) return b.installs - a.installs;
      if (b.reviews !== a.reviews) return b.reviews - a.reviews;
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return a.name.localeCompare(b.name);
    });

  const total = ranked.length;
  const effectiveLimit = opts?.limit && opts.limit > 0 ? Math.floor(opts.limit) : total;

  const rankings: LeaderboardRow[] = ranked.slice(0, effectiveLimit).map((row, idx) => ({
    rank: idx + 1,
    ...row,
  }));

  return { rankings, total };
}
