/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Period = "30d" | "60d" | "90d";
type Metric = "installs" | "reviews" | "apiCalls" | "total";

type HeatmapEntry = {
  date: string;
  installs: number;
  reviews: number;
  apiCalls: number;
  totalActivity: number;
  value: number;
};

type HeatmapResponse = {
  period: Period;
  metric: Metric;
  generatedAt: string;
  summary: {
    days: number;
    total: number;
    average: number;
    min: number;
    max: number;
    activeDays: number;
    peakDate: string | null;
    peakValue: number;
  };
  entries: HeatmapEntry[];
};

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "60d", label: "Last 60 days" },
  { value: "90d", label: "Last 90 days" },
];

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
  { value: "total", label: "Total Activity" },
  { value: "installs", label: "Installs" },
  { value: "reviews", label: "Reviews" },
  { value: "apiCalls", label: "API Calls" },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function getLevel(value: number, max: number): number {
  if (!value || max <= 0) return 0;
  const ratio = value / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function levelClass(level: number): string {
  switch (level) {
    case 1:
      return "bg-cyan/25";
    case 2:
      return "bg-cyan/45";
    case 3:
      return "bg-cyan/70";
    case 4:
      return "bg-cyan";
    default:
      return "bg-white/5";
  }
}

export default function ActivityHeatmapPage() {
  const [period, setPeriod] = useState<Period>("90d");
  const [metric, setMetric] = useState<Metric>("total");
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/analytics/heatmap?period=${period}&metric=${metric}`,
          { cache: "no-store", signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`Failed to load heatmap (${res.status})`);
        }

        const json = (await res.json()) as HeatmapResponse;
        setData(json);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Couldn't load activity heatmap data.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [period, metric]);

  const heatmapWeeks = useMemo(() => {
    if (!data?.entries.length) return [] as { date: string; entry: HeatmapEntry | null }[][];

    const entryMap = new Map(data.entries.map((entry) => [entry.date, entry]));
    const firstDate = new Date(`${data.entries[0].date}T00:00:00.000Z`);
    const lastDate = new Date(`${data.entries[data.entries.length - 1].date}T00:00:00.000Z`);

    const gridStart = new Date(firstDate);
    gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());

    const gridEnd = new Date(lastDate);
    gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));

    const cells: { date: string; entry: HeatmapEntry | null }[] = [];

    for (let d = new Date(gridStart); d <= gridEnd; d.setUTCDate(d.getUTCDate() + 1)) {
      const date = d.toISOString().slice(0, 10);
      cells.push({
        date,
        entry: entryMap.get(date) ?? null,
      });
    }

    return chunk(cells, 7);
  }, [data]);

  return (
    <div className="min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">📅 Activity Heatmap</h1>
        <p className="text-muted-foreground text-lg">
          Calendar-style view of real activity metrics over time.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={metric} onValueChange={(value) => setMetric(value as Metric)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {METRIC_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl text-cyan">
                {data?.summary.total.toLocaleString() ?? "—"}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardDescription>Daily Average</CardDescription>
              <CardTitle className="text-3xl text-purple">{data?.summary.average ?? "—"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardDescription>Active Days</CardDescription>
              <CardTitle className="text-3xl text-green">{data?.summary.activeDays ?? "—"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-2">
              <CardDescription>Peak Day</CardDescription>
              <CardTitle className="text-xl text-yellow">
                {data?.summary.peakDate ?? "—"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{data?.summary.peakValue ?? 0} events</p>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle>GitHub-style Contribution Grid</CardTitle>
            <CardDescription>
              Hover a day to see installs, reviews, API calls, and total activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <p className="text-sm text-muted-foreground">Loading heatmap…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}

            {!loading && !error && data && (
              <div className="overflow-x-auto">
                <div className="inline-flex gap-2">
                  <div className="grid grid-rows-7 gap-1 pt-4 pr-1 text-[11px] text-muted-foreground">
                    <span className="h-3">Sun</span>
                    <span className="h-3" />
                    <span className="h-3">Tue</span>
                    <span className="h-3" />
                    <span className="h-3">Thu</span>
                    <span className="h-3" />
                    <span className="h-3">Sat</span>
                  </div>

                  <div className="flex gap-1">
                    {heatmapWeeks.map((week, weekIndex) => (
                      <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
                        {week.map((cell) => {
                          const value = cell.entry?.value ?? 0;
                          const level = getLevel(value, data.summary.max);

                          return (
                            <div key={cell.date} className="group relative">
                              <div
                                className={`h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-cyan/60 ${levelClass(level)} ${cell.entry ? "cursor-pointer" : "opacity-40"}`}
                              />

                              {cell.entry && (
                                <div className="pointer-events-none absolute left-1/2 top-5 z-20 hidden min-w-[180px] -translate-x-1/2 rounded-md border border-white/10 bg-black/90 p-2 text-xs text-white shadow-xl group-hover:block">
                                  <p className="font-semibold mb-1">{cell.entry.date}</p>
                                  <p>Installs: {cell.entry.installs}</p>
                                  <p>Reviews: {cell.entry.reviews}</p>
                                  <p>API Calls: {cell.entry.apiCalls}</p>
                                  <p>Total: {cell.entry.totalActivity}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="h-3 w-3 rounded-sm bg-white/5" />
                  <div className="h-3 w-3 rounded-sm bg-cyan/25" />
                  <div className="h-3 w-3 rounded-sm bg-cyan/45" />
                  <div className="h-3 w-3 rounded-sm bg-cyan/70" />
                  <div className="h-3 w-3 rounded-sm bg-cyan" />
                  <span>More</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
