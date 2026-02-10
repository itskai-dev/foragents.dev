import { NextRequest, NextResponse } from "next/server";
import heatmapSeed from "@/../data/activity-heatmap.json";

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

const VALID_PERIODS: Period[] = ["30d", "60d", "90d"];
const VALID_METRICS: Metric[] = ["installs", "reviews", "apiCalls", "total"];

function getMetricValue(entry: HeatmapEntry, metric: Metric): number {
  if (metric === "installs") return entry.installs;
  if (metric === "reviews") return entry.reviews;
  if (metric === "apiCalls") return entry.apiCalls;
  return entry.totalActivity;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedPeriod = searchParams.get("period") as Period | null;
  const requestedMetric = searchParams.get("metric") as Metric | null;

  const period: Period = requestedPeriod && VALID_PERIODS.includes(requestedPeriod)
    ? requestedPeriod
    : "90d";

  const metric: Metric = requestedMetric && VALID_METRICS.includes(requestedMetric)
    ? requestedMetric
    : "total";

  const allEntries = (heatmapSeed as { entries: HeatmapEntry[] }).entries
    .slice()
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));

  const days = PERIOD_TO_DAYS[period];
  const entries = allEntries.slice(-days);

  const values = entries.map((entry) => getMetricValue(entry, metric));
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const average = values.length > 0 ? Number((total / values.length).toFixed(2)) : 0;

  const peakEntry =
    entries.length > 0
      ? entries.reduce((peak, current) =>
          getMetricValue(current, metric) > getMetricValue(peak, metric) ? current : peak
        )
      : null;

  const response = {
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
      peakValue: peakEntry ? getMetricValue(peakEntry, metric) : 0,
    },
    entries: entries.map((entry) => ({
      ...entry,
      value: getMetricValue(entry, metric),
    })),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
