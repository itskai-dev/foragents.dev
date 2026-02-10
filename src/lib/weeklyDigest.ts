import { getSkills } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";
import { getComputedTrendingSkills } from "@/lib/server/trendingCatalog";
import { getBounties } from "@/lib/bounties";
import skillVersionsData from "../../data/skill-versions.json";

export type WeeklyDigestResponse = {
  week: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
    label: string;
  };
  newSkills: number;
  newReviews: number;
  trending: Array<{
    slug: string;
    name: string;
    trendingScore: number;
    trendingBadge: string | null;
  }>;
  bounties: {
    new: number;
    claimed: number;
  };
  highlights: string[];
};

type SkillVersionHistory = {
  slug: string;
  versions?: Array<{
    date?: string;
  }>;
};

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isBetweenInclusive(target: Date, start: Date, end: Date): boolean {
  const time = target.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function endOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

function buildWeekWindow(now: Date): { start: Date; end: Date } {
  const end = endOfUtcDay(now);
  const start = startOfUtcDay(new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000));
  return { start, end };
}

function buildSkillCreatedAtIndex(): Map<string, Date> {
  const map = new Map<string, Date>();
  const histories = Array.isArray(skillVersionsData)
    ? (skillVersionsData as SkillVersionHistory[])
    : [];

  for (const history of histories) {
    if (!history?.slug || !Array.isArray(history.versions)) continue;

    let oldest: Date | null = null;

    for (const version of history.versions) {
      const date = parseDate(version?.date);
      if (!date) continue;
      if (!oldest || date.getTime() < oldest.getTime()) {
        oldest = date;
      }
    }

    if (oldest) {
      map.set(history.slug, oldest);
    }
  }

  return map;
}

export async function generateWeeklyDigest(now = new Date()): Promise<WeeklyDigestResponse> {
  const { start, end } = buildWeekWindow(now);

  const [reviews, bounties, ranked] = await Promise.all([
    getAllReviews(),
    getBounties(),
    getComputedTrendingSkills(getSkills()),
  ]);

  const skillCreatedAt = buildSkillCreatedAtIndex();
  const newSkills = getSkills().filter((skill) => {
    const createdAt = skillCreatedAt.get(skill.slug);
    if (!createdAt) return false;
    return isBetweenInclusive(createdAt, start, end);
  }).length;

  const newReviews = reviews.filter((review) => {
    const createdAt = parseDate(review.createdAt);
    return createdAt ? isBetweenInclusive(createdAt, start, end) : false;
  }).length;

  const newBounties = bounties.filter((bounty) => {
    const createdAt = parseDate(bounty.createdAt);
    return createdAt ? isBetweenInclusive(createdAt, start, end) : false;
  }).length;

  const claimedBounties = bounties.filter((bounty) => {
    if (bounty.status === "open") return false;

    const claimedAt = parseDate(bounty.claim?.claimedAt);
    if (claimedAt) return isBetweenInclusive(claimedAt, start, end);

    // Fallback for seed rows that only carry status without claim metadata.
    const createdAt = parseDate(bounty.createdAt);
    return createdAt ? isBetweenInclusive(createdAt, start, end) : false;
  }).length;

  const trending = ranked.slice(0, 5).map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    trendingScore: skill.trendingScore,
    trendingBadge: skill.badge,
  }));

  const highlights: string[] = [
    `${newSkills} new skills added this week`,
    `${newReviews} community reviews submitted`,
    `${newBounties} new bounties posted, ${claimedBounties} claimed`,
  ];

  if (trending.length > 0) {
    highlights.push(`Trending now: ${trending.slice(0, 3).map((skill) => skill.name).join(", ")}`);
  }

  return {
    week: {
      start: toYmd(start),
      end: toYmd(end),
      label: `${toYmd(start)} → ${toYmd(end)}`,
    },
    newSkills,
    newReviews,
    trending,
    bounties: {
      new: newBounties,
      claimed: claimedBounties,
    },
    highlights,
  };
}
