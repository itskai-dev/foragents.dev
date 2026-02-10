/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AnalyticsPeriod = "7d" | "30d" | "90d";

type AnalyticsResponse = {
  period: AnalyticsPeriod;
  generatedAt: string;
  summary: {
    totalSkills: number;
    totalAgents: number;
    totalInstalls: number;
    totalReviews: number;
  };
  topSkills: Array<{
    slug: string;
    name: string;
    installs: number;
    reviews: number;
    averageRating: number;
  }>;
  activity: Array<{
    date: string;
    count: number;
    events: number;
    bounties: number;
    community: number;
  }>;
};

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics?period=${period}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const payload = (await response.json()) as AnalyticsResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setData(null);
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load analytics");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run().catch(() => {
      if (!cancelled) {
        setData(null);
        setError("Failed to load analytics");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [period]);

  const maxActivity = useMemo(() => {
    if (!data?.activity?.length) return 1;
    return Math.max(1, ...data.activity.map((entry) => entry.count));
  }, [data]);

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">📊 Analytics Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Live metrics from skills, agents, installs, reviews, and community activity.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap justify-end gap-2">
          {(["7d", "30d", "90d"] as AnalyticsPeriod[]).map((candidate) => (
            <button
              key={candidate}
              onClick={() => setPeriod(candidate)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                period === candidate
                  ? "bg-cyan text-[#0A0E17]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
              disabled={loading && period === candidate}
            >
              {PERIOD_LABELS[candidate]}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-8 text-center text-muted-foreground">Loading analytics…</CardContent>
          </Card>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <Card className="bg-card/50 border-red-500/20">
            <CardContent className="p-8 text-center">
              <p className="text-red-300 font-medium">Couldn't load analytics</p>
              <p className="text-muted-foreground text-sm mt-2">{error}</p>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {!loading && !error && data ? (
        <>
          <section className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-cyan">
                    {NUMBER_FORMATTER.format(data.summary.totalSkills)}
                  </CardTitle>
                  <CardDescription>Total skills</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-purple">
                    {NUMBER_FORMATTER.format(data.summary.totalAgents)}
                  </CardTitle>
                  <CardDescription>Total agents</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-green">
                    {NUMBER_FORMATTER.format(data.summary.totalInstalls)}
                  </CardTitle>
                  <CardDescription>Total installs</CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-card/50 border-white/5">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-yellow">
                    {NUMBER_FORMATTER.format(data.summary.totalReviews)}
                  </CardTitle>
                  <CardDescription>Total reviews</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">🏆 Top Skills by Installs</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6 space-y-4">
                {data.topSkills.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No install data available yet.</p>
                ) : (
                  data.topSkills.map((skill, index) => (
                    <div key={skill.slug} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/[0.03]">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="outline" className="bg-white/5 text-white/80 border-white/10">
                          #{index + 1}
                        </Badge>
                        <div className="min-w-0">
                          <Link href={`/skills/${skill.slug}`} className="font-semibold hover:text-cyan transition-colors">
                            {skill.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {NUMBER_FORMATTER.format(skill.reviews)} reviews · {skill.averageRating.toFixed(1)} ⭐
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground whitespace-nowrap">
                        {NUMBER_FORMATTER.format(skill.installs)} installs
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">📈 Activity Trend ({PERIOD_LABELS[data.period]})</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6 space-y-3">
                {data.activity.map((entry) => {
                  const width = (entry.count / maxActivity) * 100;
                  return (
                    <div key={entry.date} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{entry.date}</span>
                        <span>
                          total {entry.count} · events {entry.events} · bounties {entry.bounties} · community {entry.community}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan to-purple rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          <section className="max-w-5xl mx-auto px-4 py-10">
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          </section>
        </>
      ) : null}
    </div>
  );
}
