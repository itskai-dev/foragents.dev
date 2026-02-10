import { NextRequest, NextResponse } from "next/server";
import {
  createAnalyticsMetric,
  filterAnalyticsMetrics,
  readAnalyticsMetrics,
  type AnalyticsMetricEntry,
  type AnalyticsPeriod,
} from "@/lib/analytics";

export const runtime = "nodejs";

function parsePeriod(value: string | null): AnalyticsPeriod | undefined {
  if (value === "7d" || value === "30d" || value === "60d" || value === "90d") {
    return value;
  }
  return undefined;
}

function buildSummary(entries: AnalyticsMetricEntry[]) {
  const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
  const categories = new Set(entries.map((entry) => entry.category));
  const sources = new Set(entries.map((entry) => entry.source));
  const metrics = new Set(entries.map((entry) => entry.metric));

  const byCategory = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + entry.value;
    return acc;
  }, {});

  const byMetric = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.metric] = (acc[entry.metric] ?? 0) + entry.value;
    return acc;
  }, {});

  return {
    count: entries.length,
    totalValue,
    categories: categories.size,
    sources: sources.size,
    metrics: metrics.size,
    byCategory,
    byMetric,
  };
}

export async function GET(request: NextRequest) {
  const period = parsePeriod(request.nextUrl.searchParams.get("period"));
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;

  const allEntries = await readAnalyticsMetrics();
  const entries = filterAnalyticsMetrics(allEntries, { period, category, search });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      filters: {
        period: period ?? null,
        category: category ?? null,
        search: search ?? null,
      },
      totalAvailable: allEntries.length,
      entries,
      summary: buildSummary(entries),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AnalyticsMetricEntry>;
    const created = await createAnalyticsMetric(body);

    return NextResponse.json(
      {
        ok: true,
        entry: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create analytics metric",
      },
      { status: 400 }
    );
  }
}
