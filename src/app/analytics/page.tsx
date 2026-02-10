/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AnalyticsPeriod = "7d" | "30d" | "60d" | "90d";

type AnalyticsEntry = {
  id: string;
  metric: string;
  value: number;
  category: string;
  period: AnalyticsPeriod;
  source: string;
  tags: string[];
  updatedAt: string;
};

type AnalyticsResponse = {
  generatedAt: string;
  filters: {
    period: AnalyticsPeriod | null;
    category: string | null;
    search: string | null;
  };
  totalAvailable: number;
  entries: AnalyticsEntry[];
  summary: {
    count: number;
    totalValue: number;
    categories: number;
    sources: number;
    metrics: number;
    byCategory: Record<string, number>;
    byMetric: Record<string, number>;
  };
};

const PERIOD_OPTIONS: AnalyticsPeriod[] = ["7d", "30d", "60d", "90d"];
const CATEGORY_OPTIONS = ["all", "adoption", "usage", "growth", "quality", "engagement", "community"];

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("period", period);
        if (category !== "all") params.set("category", category);
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(`/api/analytics?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const payload = (await response.json()) as AnalyticsResponse;
        setData(payload);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") {
          setData(null);
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load analytics");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [period, category, search]);

  const topMetrics = useMemo(() => {
    const metricMap = data?.summary.byMetric ?? {};
    return Object.entries(metricMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [data]);

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">📊 Analytics Dashboard</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Persistent analytics data with filtering by period, category, and search.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-6">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            <span className="text-muted-foreground">Period</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="text-muted-foreground">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <form
            className="text-sm"
            onSubmit={(event) => {
              event.preventDefault();
              setSearch(searchInput);
            }}
          >
            <span className="text-muted-foreground">Search</span>
            <div className="mt-1 flex gap-2">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="metric, source, tag"
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-md bg-cyan px-3 py-2 text-black font-medium"
              >
                Go
              </button>
            </div>
          </form>
        </div>
      </section>

      {loading && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-8 text-center text-muted-foreground">Loading analytics…</CardContent>
          </Card>
        </section>
      )}

      {!loading && error && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <Card className="bg-card/50 border-red-500/20">
            <CardContent className="p-8 text-center">
              <p className="text-red-300 font-medium">Couldn't load analytics</p>
              <p className="text-muted-foreground text-sm mt-2">{error}</p>
            </CardContent>
          </Card>
        </section>
      )}

      {!loading && !error && data && (
        <>
          <section className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-cyan">
                    {NUMBER_FORMATTER.format(data.summary.count)}
                  </CardTitle>
                  <CardDescription>Matching rows</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-purple">
                    {NUMBER_FORMATTER.format(data.summary.totalValue)}
                  </CardTitle>
                  <CardDescription>Total value</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-green">
                    {NUMBER_FORMATTER.format(data.summary.categories)}
                  </CardTitle>
                  <CardDescription>Categories</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-yellow">
                    {NUMBER_FORMATTER.format(data.totalAvailable)}
                  </CardTitle>
                  <CardDescription>Total stored rows</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Top metrics</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6 space-y-3">
                {topMetrics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No metric rows found.</p>
                ) : (
                  topMetrics.map(([metric, value]) => (
                    <div key={metric} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3">
                      <p className="font-medium">{metric}</p>
                      <p className="text-sm text-muted-foreground">{NUMBER_FORMATTER.format(value)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="max-w-5xl mx-auto px-4 pb-12">
            <h2 className="text-2xl font-bold mb-6">Rows</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-0 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left">Metric</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-4 py-3 text-right">Value</th>
                      <th className="px-4 py-3 text-left">Tags</th>
                      <th className="px-4 py-3 text-left">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((entry) => (
                      <tr key={entry.id} className="border-t border-white/5 align-top">
                        <td className="px-4 py-3 font-medium">{entry.metric}</td>
                        <td className="px-4 py-3">{entry.category}</td>
                        <td className="px-4 py-3">{entry.source}</td>
                        <td className="px-4 py-3 text-right">{NUMBER_FORMATTER.format(entry.value)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map((tag) => (
                              <Badge key={`${entry.id}-${tag}`} variant="outline" className="border-white/10 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(entry.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
