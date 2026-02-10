import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAgents, getSkills } from "@/lib/data";
import { getAllReviews } from "@/lib/reviews";
import { getBounties } from "@/lib/bounties";
import { readEventsFile } from "@/lib/eventsStore";
import { readCommunityThreadsFile } from "@/lib/server/communityThreadsStore";
import { readMcpInstallCounts } from "@/lib/server/mcpInstalls";
import { readSkillMetricStore } from "@/lib/server/skillMetrics";
import { readSkillInstallCounts } from "@/lib/server/skillInstalls";

export const runtime = "nodejs";

type Period = "7d" | "30d" | "90d";

type DayBucket = {
  date: string;
  count: number;
  events: number;
  bounties: number;
  community: number;
};

function parsePeriod(value: string | null): Period {
  if (value === "7d" || value === "30d" || value === "90d") {
    return value;
  }
  return "30d";
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getRange(period: Period): { start: Date; end: Date; days: number } {
  const now = new Date();
  const end = startOfUtcDay(now);
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const start = addUtcDays(end, -(days - 1));

  return { start, end, days };
}

function toDateKey(input: string): string | null {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function sumCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, value) => {
    if (!Number.isFinite(value) || value < 0) return sum;
    return sum + Math.floor(value);
  }, 0);
}

async function readAgentsFromDataDir(): Promise<number | null> {
  const filePath = path.join(process.cwd(), "data", "agents.json");
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return 0;
    return parsed.length;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const period = parsePeriod(request.nextUrl.searchParams.get("period"));
  const { start, days } = getRange(period);
  const rangeStartKey = start.toISOString().slice(0, 10);

  const [
    reviews,
    skillInstallCounts,
    mcpInstallCounts,
    skillMetricStore,
    bounties,
    events,
    threads,
    agentsFromDataDir,
  ] = await Promise.all([
    getAllReviews(),
    readSkillInstallCounts(),
    readMcpInstallCounts(),
    readSkillMetricStore(),
    getBounties(),
    readEventsFile(),
    readCommunityThreadsFile(),
    readAgentsFromDataDir(),
  ]);

  const skills = getSkills();
  const totalAgents = agentsFromDataDir ?? getAgents().length;

  const reviewMap = new Map<string, { count: number; ratingSum: number }>();
  for (const review of reviews) {
    const current = reviewMap.get(review.skillSlug) ?? { count: 0, ratingSum: 0 };
    current.count += 1;
    current.ratingSum += Number.isFinite(review.rating) ? review.rating : 0;
    reviewMap.set(review.skillSlug, current);
  }

  const topSkills = skills
    .map((skill) => {
      const baseInstalls = skillInstallCounts[skill.slug] ?? 0;
      const trackedInstalls = skillMetricStore.installs_total[skill.slug] ?? 0;
      const installs = baseInstalls + trackedInstalls;
      const reviewStats = reviewMap.get(skill.slug);
      const reviewCount = reviewStats?.count ?? 0;
      const averageRating =
        reviewCount > 0 ? Number((reviewStats!.ratingSum / reviewCount).toFixed(2)) : 0;

      return {
        slug: skill.slug,
        name: skill.name,
        installs,
        reviews: reviewCount,
        averageRating,
      };
    })
    .sort((a, b) => {
      if (b.installs !== a.installs) return b.installs - a.installs;
      if (b.reviews !== a.reviews) return b.reviews - a.reviews;
      return b.averageRating - a.averageRating;
    })
    .slice(0, 10);

  const totalSkillInstalls = sumCounts(skillInstallCounts) + sumCounts(skillMetricStore.installs_total);
  const totalMcpInstalls = sumCounts(mcpInstallCounts);
  const totalInstalls = totalSkillInstalls + totalMcpInstalls;

  const buckets = new Map<string, DayBucket>();
  for (let i = 0; i < days; i += 1) {
    const date = addUtcDays(start, i).toISOString().slice(0, 10);
    buckets.set(date, {
      date,
      count: 0,
      events: 0,
      bounties: 0,
      community: 0,
    });
  }

  const addActivity = (dateValue: string, key: keyof Omit<DayBucket, "date" | "count">) => {
    const dateKey = toDateKey(dateValue);
    if (!dateKey || dateKey < rangeStartKey) return;
    const bucket = buckets.get(dateKey);
    if (!bucket) return;

    bucket[key] += 1;
    bucket.count += 1;
  };

  for (const event of events) {
    addActivity(event.createdAt || event.date, "events");
  }

  for (const bounty of bounties) {
    addActivity(bounty.createdAt, "bounties");
  }

  for (const thread of threads) {
    addActivity(thread.createdAt, "community");
    for (const reply of thread.replies) {
      addActivity(reply.createdAt, "community");
    }
  }

  const activity = Array.from(buckets.values());

  return NextResponse.json(
    {
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalSkills: skills.length,
        totalAgents,
        totalInstalls,
        totalReviews: reviews.length,
      },
      topSkills,
      activity,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
