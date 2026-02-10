import { NextRequest, NextResponse } from "next/server";
import { filterAnalyticsMetrics, readAnalyticsMetrics, type AnalyticsMetricEntry } from "@/lib/analytics";

type Period = "30d" | "60d" | "90d";
type Metric = "installs" | "reviews" | "apiCalls" | "total";

type HeatmapEntry = {
  date: string;
  installs: number;
  reviews: number;
  apiCalls: number;
  totalActivity: number;
};

const PERIOD_TO_DAYS: Record<Period, number> = {
  "30d": 30,
  "60d": 60,
  "90d": 90,
};

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function metricValue(entry: HeatmapEntry, metric: Metric): number {
  if (metric === "installs") return entry.installs;
  if (metric === "reviews") return entry.reviews;
  if (metric === "apiCalls") return entry.apiCalls;
  return entry.totalActivity;
}

function classify(entry: AnalyticsMetricEntry): { installs: number; reviews: number; apiCalls: number } {
  const text = `${entry.metric} ${entry.category} ${entry.source} ${entry.tags.join(" ")}`.toLowerCase();

  const installs = text.includes("install") || text.includes("adoption") ? entry.value : 0;
  const reviews = text.includes("review") || text.includes("rating") || text.includes("feedback") ? entry.value : 0;
  const apiCalls = text.includes("api") || text.includes("request") || text.includes("traffic") ? entry.value : 0;

  return { installs, reviews, apiCalls };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedPeriod = searchParams.get("period");
  const requestedMetric = searchParams.get("metric");

  const period: Period = requestedPeriod === "30d" || requestedPeriod === "60d" || requestedPeriod === "90d"
    ? requestedPeriod
    : "90d";

  const metric: Metric =
    requestedMetric === "installs" ||
    requestedMetric === "reviews" ||
    requestedMetric === "apiCalls" ||
    requestedMetric === "total"
      ? requestedMetric
      : "total";

  const allEntries = await readAnalyticsMetrics();
  const filtered = filterAnalyticsMetrics(allEntries, { period });

  const today = new Date();
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const days = PERIOD_TO_DAYS[period];
  const start = addUtcDays(end, -(days - 1));

  const daily = new Map<string, HeatmapEntry>();

  for (let i = 0; i < days; i += 1) {
    const date = addUtcDays(start, i).toISOString().slice(0, 10);
    daily.set(date, {
      date,
      installs: 0,
      reviews: 0,
      apiCalls: 0,
      totalActivity: 0,
    });
  }

  for (const item of filtered) {
    const dateKey = new Date(item.updatedAt).toISOString().slice(0, 10);
    const bucket = daily.get(dateKey);
    if (!bucket) continue;

    const classified = classify(item);
    bucket.installs += classified.installs;
    bucket.reviews += classified.reviews;
    bucket.apiCalls += classified.apiCalls;
    bucket.totalActivity += item.value;
  }

  const entries = Array.from(daily.values());
  const values = entries.map((entry) => metricValue(entry, metric));
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = values.length ? Math.max(...values) : 0;
  const min = values.length ? Math.min(...values) : 0;
  const average = values.length ? Number((total / values.length).toFixed(2)) : 0;

  const peakEntry =
    entries.length > 0
      ? entries.reduce((peak, current) =>
          metricValue(current, metric) > metricValue(peak, metric) ? current : peak
        )
      : null;

  return NextResponse.json(
    {
      period,
      metric,
      generatedAt: new Date().toISOString(),
      summary: {
        days: entries.length,
        total,
        average,
        min,
        max,
        activeDays: values.filter((value) => value > 0).length,
        peakDate: peakEntry?.date ?? null,
        peakValue: peakEntry ? metricValue(peakEntry, metric) : 0,
      },
      entries: entries.map((entry) => ({
        ...entry,
        value: metricValue(entry, metric),
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
