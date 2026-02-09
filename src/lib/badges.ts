import "server-only";

import path from "path";
import { readFileSync } from "fs";

import { getSkills, getSkillBySlug, type Skill } from "@/lib/data";
import { readSkillMetricStore } from "@/lib/server/skillMetrics";
import { readCanaryScorecards, type CanaryScorecard } from "@/lib/server/canaryScorecardStore";
import { getTrendingSkillsWithBadges } from "@/lib/server/trendingSkills";
import { getSkillRatingsSummary } from "@/lib/server/skillFeedback";

export type BadgeDefinition = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  criteria: string;
};

export type SkillBadgeContext = {
  slug: string;
  installs?: number;
  canaryPassRate?: number;
  verified?: boolean;
  trendingRank?: number;
  docsScore?: number;
  avgRating?: number;
  daysAbove95?: number;
  ageInDays?: number;
};

const BADGE_DEFINITIONS_PATH = path.join(process.cwd(), "data", "badge-definitions.json");

function readBadgeDefinitions(): BadgeDefinition[] {
  const raw = readFileSync(BADGE_DEFINITIONS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((row): BadgeDefinition | null => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id : "";
      const name = typeof r.name === "string" ? r.name : "";
      const emoji = typeof r.emoji === "string" ? r.emoji : "";
      const description = typeof r.description === "string" ? r.description : "";
      const criteria = typeof r.criteria === "string" ? r.criteria : "";
      if (!id || !name || !emoji || !criteria) return null;
      return { id, name, emoji, description, criteria };
    })
    .filter(Boolean) as BadgeDefinition[];
}

// Module-level cache (safe on server).
const BADGE_DEFINITIONS: BadgeDefinition[] = readBadgeDefinitions();

export function getAllBadges(): BadgeDefinition[] {
  return BADGE_DEFINITIONS;
}

function parseLiteral(raw: string): unknown {
  const s = raw.trim();
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);

  // Allow quoted strings (not currently used, but harmless).
  const m = s.match(/^(['\"])(.*)\1$/);
  if (m) return m[2];

  return null;
}

function evaluateCriteria(criteria: string, ctx: Record<string, unknown>): boolean {
  const m = criteria.match(/^\s*([a-zA-Z0-9_]+)\s*(>=|<=|===|==|>|<)\s*(.+?)\s*$/);
  if (!m) return false;

  const key = m[1]!;
  const op = m[2]!;
  const rhs = parseLiteral(m[3]!);
  const lhs = ctx[key];

  if (op === "===" || op === "==") {
    return lhs === rhs;
  }

  const leftNum = typeof lhs === "number" ? lhs : Number(lhs);
  const rightNum = typeof rhs === "number" ? rhs : Number(rhs);
  if (!Number.isFinite(leftNum) || !Number.isFinite(rightNum)) return false;

  if (op === ">=") return leftNum >= rightNum;
  if (op === "<=") return leftNum <= rightNum;
  if (op === ">") return leftNum > rightNum;
  if (op === "<") return leftNum < rightNum;

  return false;
}

export function computeBadgesForSkill(skill: SkillBadgeContext): BadgeDefinition[] {
  const defs = getAllBadges();
  const ctx: Record<string, unknown> = { ...skill };

  return defs.filter((b) => {
    try {
      return evaluateCriteria(b.criteria, ctx);
    } catch {
      return false;
    }
  });
}

function latestCanaryPassRate(slug: string, scorecards: CanaryScorecard[]): number | null {
  const rows = scorecards.filter((s) => s.agentId === slug);
  if (rows.length === 0) return null;
  const latest = rows.reduce((max, s) => (s.date > max.date ? s : max), rows[0]!);
  return latest.passRate;
}

function daysAbove95(slug: string, scorecards: CanaryScorecard[]): number {
  return scorecards.filter((s) => s.agentId === slug && s.passRate >= 0.95).length;
}

function earliestIsoDay(input: string[]): string | null {
  if (input.length === 0) return null;
  let min = input[0]!;
  for (const d of input) {
    if (d < min) min = d;
  }
  return min;
}

function computeAgeInDays(input: { slug: string; metrics: Awaited<ReturnType<typeof readSkillMetricStore>>; scorecards: CanaryScorecard[] }): number | null {
  const { slug, metrics, scorecards } = input;

  const metricDays = [
    ...Object.keys(metrics.installs_by_day[slug] ?? {}),
    ...Object.keys(metrics.views_by_day[slug] ?? {}),
  ];

  const canaryDays = scorecards.filter((s) => s.agentId === slug).map((s) => s.date);

  const earliest = earliestIsoDay([...metricDays, ...canaryDays]);
  if (!earliest) return null;

  const t = new Date(`${earliest}T00:00:00.000Z`).getTime();
  if (!Number.isFinite(t)) return null;

  const now = Date.now();
  const days = Math.floor((now - t) / 86_400_000);
  return Number.isFinite(days) && days >= 0 ? days : null;
}

function computeDocsScore(skill: Skill): number {
  // Heuristic-only.
  // (We don't fetch GitHub contents here; keep deterministic + offline.)
  let score = 0;
  if (skill.repo_url) score += 1;
  if (skill.description && skill.description.trim().length >= 120) score += 1;
  if ((skill.tags?.length ?? 0) >= 4) score += 1;
  return score;
}

export async function getSkillBadges(slug: string): Promise<BadgeDefinition[]> {
  const skills = getSkills();
  const skill = getSkillBySlug(slug);
  if (!skill) return [];

  const [metrics, scorecards, trending, ratingSummary] = await Promise.all([
    readSkillMetricStore(),
    readCanaryScorecards(),
    getTrendingSkillsWithBadges(skills),
    getSkillRatingsSummary({ artifact_slug: slug }),
  ]);

  const trendingRank = (() => {
    const idx = trending.findIndex((s) => s.slug === slug);
    return idx >= 0 ? idx + 1 : undefined;
  })();

  const installs = metrics.installs_total[slug] ?? 0;
  const canaryPassRate = latestCanaryPassRate(slug, scorecards) ?? undefined;
  const days95 = daysAbove95(slug, scorecards);
  const ageInDays = computeAgeInDays({ slug, metrics, scorecards }) ?? undefined;

  const ctx: SkillBadgeContext = {
    slug,
    installs,
    canaryPassRate,
    verified: !!skill.verification,
    trendingRank,
    docsScore: computeDocsScore(skill),
    avgRating: ratingSummary.avg ?? undefined,
    daysAbove95: days95,
    ageInDays,
  };

  return computeBadgesForSkill(ctx);
}

export async function getBadgesForSkills(skills: Skill[]): Promise<Record<string, BadgeDefinition[]>> {
  const [metrics, scorecards, trending] = await Promise.all([
    readSkillMetricStore(),
    readCanaryScorecards(),
    getTrendingSkillsWithBadges(skills),
  ]);

  const trendingRankBySlug = new Map<string, number>();
  for (let i = 0; i < trending.length; i++) {
    trendingRankBySlug.set(trending[i]!.slug, i + 1);
  }

  // Ratings: keep it simple (15 skills), but do it in parallel.
  const ratingSummaries = await Promise.all(
    skills.map(async (s) => {
      const res = await getSkillRatingsSummary({ artifact_slug: s.slug });
      return [s.slug, res] as const;
    })
  );
  const ratingBySlug = new Map(ratingSummaries);

  const out: Record<string, BadgeDefinition[]> = {};

  for (const skill of skills) {
    const slug = skill.slug;

    const installs = metrics.installs_total[slug] ?? 0;
    const canaryPassRate = latestCanaryPassRate(slug, scorecards) ?? undefined;

    const ctx: SkillBadgeContext = {
      slug,
      installs,
      canaryPassRate,
      verified: !!skill.verification,
      trendingRank: trendingRankBySlug.get(slug),
      docsScore: computeDocsScore(skill),
      avgRating: ratingBySlug.get(slug)?.avg ?? undefined,
      daysAbove95: daysAbove95(slug, scorecards),
      ageInDays: computeAgeInDays({ slug, metrics, scorecards }) ?? undefined,
    };

    out[slug] = computeBadgesForSkill(ctx);
  }

  return out;
}
