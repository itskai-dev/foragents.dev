"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/lib/data";
import type { CanaryScorecard, CanaryScorecardTrend } from "@/lib/server/canaryScorecardStore";

type RangeKey = "today" | "7d" | "30d";

function trendGlyph(trend: CanaryScorecardTrend) {
  if (trend === "improving") return "↑";
  if (trend === "declining") return "↓";
  return "→";
}

function formatPct(v: number) {
  if (!Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(2)}%`;
}

function formatMs(ms: number) {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function addDaysISO(date: string, days: number): string {
  const [y, m, d] = date.split("-").map((v) => Number(v));
  const base = new Date(Date.UTC(y!, (m! - 1), d!));
  base.setUTCDate(base.getUTCDate() + days);
  const yyyy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

type Row = {
  agentId: string;
  skill: Skill | null;
  passRate: number;
  avgLatencyMs: number;
  testsRun: number;
  testsPassed: number;
  regressions: string[];
  trend: CanaryScorecardTrend;
};

function aggregateForAgent(agentId: string, scorecards: CanaryScorecard[], start: string, end: string): Row | null {
  const inWindow = scorecards
    .filter((s) => s.agentId === agentId && inRange(s.date, start, end))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (inWindow.length === 0) return null;

  const testsRun = inWindow.reduce((sum, s) => sum + s.testsRun, 0);
  const testsPassed = inWindow.reduce((sum, s) => sum + s.testsPassed, 0);
  const latencyWeighted = inWindow.reduce((sum, s) => sum + s.avgLatencyMs * (s.testsRun || 0), 0);
  const avgLatencyMs = testsRun > 0 ? latencyWeighted / testsRun : inWindow[inWindow.length - 1]!.avgLatencyMs;

  const latest = inWindow[inWindow.length - 1]!;

  return {
    agentId,
    skill: null,
    passRate: testsRun > 0 ? testsPassed / testsRun : latest.passRate,
    avgLatencyMs,
    testsRun,
    testsPassed,
    regressions: latest.regressions,
    trend: latest.trend,
  };
}

export function LeaderboardClient({
  skills,
  scorecards,
}: {
  skills: Skill[];
  scorecards: CanaryScorecard[];
}) {
  const [range, setRange] = useState<RangeKey>("7d");
  const [tag, setTag] = useState<string>("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const s of skills) for (const t of s.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [skills]);

  const latestDate = useMemo(() => {
    if (!scorecards.length) return null;
    return scorecards.reduce((max, s) => (s.date > max ? s.date : max), scorecards[0]!.date);
  }, [scorecards]);

  const { startDate, endDate } = useMemo(() => {
    const end = latestDate ?? "1970-01-01";
    const start =
      range === "today" ? end : range === "7d" ? addDaysISO(end, -6) : addDaysISO(end, -29);
    return { startDate: start, endDate: end };
  }, [latestDate, range]);

  const rows = useMemo(() => {
    if (!latestDate) return [] as Row[];

    const skillById = new Map(skills.map((s) => [s.slug, s] as const));

    const candidateSkills = tag ? skills.filter((s) => s.tags.includes(tag)) : skills;

    const aggregated: Row[] = [];
    for (const s of candidateSkills) {
      const row = aggregateForAgent(s.slug, scorecards, startDate, endDate);
      if (!row) continue;
      row.skill = skillById.get(s.slug) ?? null;
      aggregated.push(row);
    }

    aggregated.sort((a, b) => {
      if (b.passRate !== a.passRate) return b.passRate - a.passRate;
      if (a.avgLatencyMs !== b.avgLatencyMs) return a.avgLatencyMs - b.avgLatencyMs;
      return b.testsRun - a.testsRun;
    });

    return aggregated;
  }, [latestDate, skills, scorecards, startDate, endDate, tag]);

  const subtitle = latestDate
    ? range === "today"
      ? `As of ${endDate}`
      : `${startDate} → ${endDate}`
    : "No scorecards yet";

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-white/5">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Controls</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={range === "today" ? "default" : "outline"}
                  onClick={() => setRange("today")}
                  className={range === "today" ? "bg-cyan text-black" : "border-white/10 bg-white/5"}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant={range === "7d" ? "default" : "outline"}
                  onClick={() => setRange("7d")}
                  className={range === "7d" ? "bg-cyan text-black" : "border-white/10 bg-white/5"}
                >
                  7d
                </Button>
                <Button
                  type="button"
                  variant={range === "30d" ? "default" : "outline"}
                  onClick={() => setRange("30d")}
                  className={range === "30d" ? "bg-cyan text-black" : "border-white/10 bg-white/5"}
                >
                  30d
                </Button>
              </div>

              <label className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Tag</span>
                <select
                  className="bg-black/30 border border-white/10 rounded-md px-2 py-1 text-sm text-foreground"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                >
                  <option value="">All</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ranked by <span className="text-foreground">pass rate</span> → <span className="text-foreground">latency</span> → <span className="text-foreground">tests run</span>.
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-white/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Rank</th>
                  <th className="text-left font-medium px-4 py-3">Skill</th>
                  <th className="text-left font-medium px-4 py-3">Pass rate</th>
                  <th className="text-left font-medium px-4 py-3">Avg latency</th>
                  <th className="text-left font-medium px-4 py-3">Tests</th>
                  <th className="text-left font-medium px-4 py-3">Trend</th>
                  <th className="text-left font-medium px-4 py-3">Badges</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                      No scorecards found for this filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => {
                    const rank = idx + 1;
                    const trophy = rank === 1 ? "🏆" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
                    const qualifies = r.passRate >= 0.95;

                    return (
                      <tr key={r.agentId} className="border-t border-white/5">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{rank}</span>
                            {trophy ? <span title={`Rank ${rank}`}>{trophy}</span> : null}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {r.skill ? (
                            <div className="space-y-1">
                              <Link
                                href={`/skills/${r.skill.slug}#reliability`}
                                className="text-foreground hover:text-cyan hover:underline font-semibold"
                              >
                                {r.skill.name}
                              </Link>
                              <div className="text-xs text-muted-foreground">{r.agentId}</div>
                              {r.regressions.length > 0 ? (
                                <div className="text-xs text-yellow-400/90">Latest: {r.regressions[0]}</div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-foreground font-mono">{r.agentId}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-foreground font-mono">{formatPct(r.passRate)}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">{formatMs(r.avgLatencyMs)}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {r.testsPassed}/{r.testsRun}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={
                              r.trend === "improving"
                                ? "bg-green-500/10 text-green-400 border-green-500/30"
                                : r.trend === "declining"
                                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                                  : "bg-white/5 text-white/70 border-white/10"
                            }
                          >
                            {trendGlyph(r.trend)} {r.trend}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {qualifies ? (
                              <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">✅ 95%+</Badge>
                            ) : null}
                            {trophy ? (
                              <Badge className="bg-cyan/10 text-cyan border border-cyan/20">
                                {trophy} Top {rank}
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Tip: click a skill to view its latest reliability scorecard.
      </div>
    </div>
  );
}
