import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import type { Skill } from "@/lib/data";
import { readSkillMetricStore } from "@/lib/server/skillMetrics";

import type { TrendingBadgeKind } from "@/lib/trendingTypes";

export type SkillTrendingResult = Skill & {
  trendingScore: number;
  trendingBadge: TrendingBadgeKind | null;
};

type SkillCommentRow = {
  artifact_slug: string;
  created_at: string;
};

type SkillRatingRow = {
  artifact_slug: string;
  created_at: string;
  rating: number;
};

const LOCAL_SKILL_COMMENTS_PATH = path.join(process.cwd(), "data", "skill_comments.json");
const LOCAL_SKILL_RATINGS_PATH = path.join(process.cwd(), "data", "skill_ratings.json");

async function readLocalJsonArray<T>(p: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function decayWeight(daysAgo: number, halfLifeDays: number): number {
  if (!Number.isFinite(daysAgo) || daysAgo < 0) return 0;
  return Math.pow(0.5, daysAgo / halfLifeDays);
}

function daysBetween(nowMs: number, pastIso: string): number {
  const t = new Date(pastIso).getTime();
  if (!Number.isFinite(t)) return Infinity;
  return (nowMs - t) / 86_400_000;
}

function decayedCountFromTimestamps(input: {
  isos: string[];
  nowMs: number;
  halfLifeDays: number;
  maxAgeDays: number;
}): number {
  let sum = 0;
  for (const iso of input.isos) {
    const d = daysBetween(input.nowMs, iso);
    if (d < 0 || d > input.maxAgeDays) continue;
    sum += decayWeight(d, input.halfLifeDays);
  }
  return sum;
}

function decayedCountFromByDay(input: {
  byDay: Record<string, number>;
  nowMs: number;
  halfLifeDays: number;
  maxAgeDays: number;
}): number {
  let sum = 0;
  for (const [day, count] of Object.entries(input.byDay)) {
    // day is YYYY-MM-DD (UTC)
    const t = new Date(`${day}T00:00:00.000Z`).getTime();
    if (!Number.isFinite(t)) continue;
    const d = (input.nowMs - t) / 86_400_000;
    if (d < 0 || d > input.maxAgeDays) continue;
    sum += (count ?? 0) * decayWeight(d, input.halfLifeDays);
  }
  return sum;
}

async function fetchSkillFeedbackRows(slugs: string[]): Promise<{
  comments: SkillCommentRow[];
  ratings: SkillRatingRow[];
}> {
  const supabase = getSupabase();

  if (supabase && slugs.length > 0) {
    const [commentsRes, ratingsRes] = await Promise.all([
      supabase
        .from("artifact_comments")
        .select("artifact_slug, created_at")
        .in("artifact_slug", slugs),
      supabase
        .from("artifact_ratings")
        .select("artifact_slug, created_at, rating")
        .in("artifact_slug", slugs),
    ]);

    // If Supabase is misconfigured / table missing, fall back to local JSON.
    if (!commentsRes.error && !ratingsRes.error) {
      return {
        comments: (commentsRes.data ?? []) as SkillCommentRow[],
        ratings: (ratingsRes.data ?? []) as SkillRatingRow[],
      };
    }

    if (commentsRes.error) console.warn("Supabase trendingSkills comments query failed:", commentsRes.error);
    if (ratingsRes.error) console.warn("Supabase trendingSkills ratings query failed:", ratingsRes.error);
  }

  const [comments, ratings] = await Promise.all([
    readLocalJsonArray<SkillCommentRow>(LOCAL_SKILL_COMMENTS_PATH),
    readLocalJsonArray<SkillRatingRow>(LOCAL_SKILL_RATINGS_PATH),
  ]);

  return { comments, ratings };
}

function assignBadges(sorted: Array<{ slug: string; trendingScore: number }>): Record<string, TrendingBadgeKind | null> {
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

export async function getTrendingSkillsWithBadges(skills: Skill[]): Promise<SkillTrendingResult[]> {
  const nowMs = Date.now();

  const slugs = skills.map((s) => s.slug);
  const [metrics, feedback] = await Promise.all([
    readSkillMetricStore(),
    fetchSkillFeedbackRows(slugs),
  ]);

  const commentsBySlug = new Map<string, SkillCommentRow[]>();
  for (const c of feedback.comments) {
    const slug = c.artifact_slug;
    if (!slug) continue;
    const arr = commentsBySlug.get(slug) ?? [];
    arr.push(c);
    commentsBySlug.set(slug, arr);
  }

  const ratingsBySlug = new Map<string, SkillRatingRow[]>();
  for (const r of feedback.ratings) {
    const slug = r.artifact_slug;
    if (!slug) continue;
    const arr = ratingsBySlug.get(slug) ?? [];
    arr.push(r);
    ratingsBySlug.set(slug, arr);
  }

  // Trending window: "this week". We still keep a soft tail for very recent history.
  const HALF_LIFE_DAYS = 3.0;
  const MAX_AGE_DAYS = 21;

  const scored = skills.map((skill) => {
    const slug = skill.slug;

    const installsTotal = metrics.installs_total[slug] ?? 0;
    const viewsTotal = metrics.views_total[slug] ?? 0;

    const installsDecay = decayedCountFromByDay({
      byDay: metrics.installs_by_day[slug] ?? {},
      nowMs,
      halfLifeDays: HALF_LIFE_DAYS,
      maxAgeDays: MAX_AGE_DAYS,
    });

    const viewsDecay = decayedCountFromByDay({
      byDay: metrics.views_by_day[slug] ?? {},
      nowMs,
      halfLifeDays: HALF_LIFE_DAYS,
      maxAgeDays: MAX_AGE_DAYS,
    });

    const comments = commentsBySlug.get(slug) ?? [];
    const ratings = ratingsBySlug.get(slug) ?? [];

    const commentsTotal = comments.length;
    const ratingsCount = ratings.length;
    const avgRating = ratingsCount
      ? ratings.reduce((a, b) => a + (typeof b.rating === "number" ? b.rating : 0), 0) / ratingsCount
      : null;

    const commentsDecay = decayedCountFromTimestamps({
      isos: comments.map((c) => c.created_at),
      nowMs,
      halfLifeDays: HALF_LIFE_DAYS,
      maxAgeDays: MAX_AGE_DAYS,
    });

    const ratingsDecay = decayedCountFromTimestamps({
      isos: ratings.map((r) => r.created_at),
      nowMs,
      halfLifeDays: HALF_LIFE_DAYS,
      maxAgeDays: MAX_AGE_DAYS,
    });

    const ratingQuality = avgRating === null ? 0 : (avgRating - 3) / 2; // -1..+1

    // Tiny deterministic baseline to avoid ties when metrics are empty.
    const baseline = 0.05 * (skill.tags?.length ?? 0) + (skill.author === "Team Reflectt" ? 0.15 : 0);

    // Core scoring (installs weighted highest).
    const score =
      baseline +
      // Totals (long-term signal)
      12.0 * Math.log1p(installsTotal) +
      3.0 * Math.log1p(viewsTotal) +
      2.0 * Math.log1p(commentsTotal) +
      2.5 * Math.log1p(ratingsCount) +
      // Recency (short-term momentum)
      20.0 * Math.log1p(installsDecay) +
      7.0 * Math.log1p(viewsDecay) +
      6.0 * Math.log1p(commentsDecay) +
      6.0 * Math.log1p(ratingsDecay) +
      // Rating quality (only matters when you have raters)
      5.0 * ratingQuality * Math.log1p(ratingsCount);

    return {
      ...skill,
      trendingScore: Number.isFinite(score) ? score : baseline,
      trendingBadge: null as TrendingBadgeKind | null,
    };
  });

  scored.sort((a, b) => b.trendingScore - a.trendingScore);

  const badges = assignBadges(scored.map((s) => ({ slug: s.slug, trendingScore: s.trendingScore })));
  for (const s of scored) {
    s.trendingBadge = badges[s.slug] ?? null;
  }

  return scored;
}

export async function getSkillTrendingMap(skills: Skill[]): Promise<Record<string, { trendingScore: number; trendingBadge: TrendingBadgeKind | null }>> {
  const ranked = await getTrendingSkillsWithBadges(skills);
  const out: Record<string, { trendingScore: number; trendingBadge: TrendingBadgeKind | null }> = {};
  for (const s of ranked) {
    out[s.slug] = { trendingScore: s.trendingScore, trendingBadge: s.trendingBadge };
  }
  return out;
}
