"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentProductivity, ProductivityPeriod } from "@/lib/productivity";

type SortKey = "tasksCompleted" | "costEfficiency" | "qualityScore" | "uptime";

const PERIOD_OPTIONS: ProductivityPeriod[] = ["7d", "30d", "90d"];

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductivityDashboardClient({ agents }: { agents: AgentProductivity[] }) {
  const [period, setPeriod] = useState<ProductivityPeriod>("30d");
  const [sortKey, setSortKey] = useState<SortKey>("tasksCompleted");

  const overview = useMemo(() => {
    const totals = agents.reduce(
      (acc, agent) => {
        const m = agent.periods[period];
        acc.tasksCompleted += m.tasksCompleted;
        acc.costSavings += m.totalCostSavings;
        acc.weightedTimeSaved += m.avgTimeSavedMinutes * m.tasksCompleted;
        acc.totalModelCost += m.modelApiCost;
        acc.totalHumanCost += m.estimatedHumanCost;
        acc.totalRework += m.reworkRate;
        acc.totalPassRate += m.testPassRate;
        acc.totalFirstAttempt += m.firstAttemptSuccess;
        return acc;
      },
      {
        tasksCompleted: 0,
        costSavings: 0,
        weightedTimeSaved: 0,
        totalModelCost: 0,
        totalHumanCost: 0,
        totalRework: 0,
        totalPassRate: 0,
        totalFirstAttempt: 0,
      }
    );

    const avgTimeSaved =
      totals.tasksCompleted > 0 ? totals.weightedTimeSaved / totals.tasksCompleted : 0;

    return {
      ...totals,
      avgTimeSaved,
      avgReworkRate: agents.length ? totals.totalRework / agents.length : 0,
      avgPassRate: agents.length ? totals.totalPassRate / agents.length : 0,
      avgFirstAttempt: agents.length ? totals.totalFirstAttempt / agents.length : 0,
      modelCostPerTask:
        totals.tasksCompleted > 0 ? totals.totalModelCost / totals.tasksCompleted : 0,
      humanCostPerTask:
        totals.tasksCompleted > 0 ? totals.totalHumanCost / totals.tasksCompleted : 0,
    };
  }, [agents, period]);

  const sortedAgents = useMemo(() => {
    const copy = [...agents];
    copy.sort((a, b) => {
      if (sortKey === "uptime") return b.uptime - a.uptime;
      return b.periods[period][sortKey] - a.periods[period][sortKey];
    });
    return copy;
  }, [agents, period, sortKey]);

  const maxUnitCost = Math.max(overview.modelCostPerTask, overview.humanCostPerTask, 1);

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 py-10 space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Agent Productivity Dashboard</h1>
        <p className="text-muted-foreground">
          Performance, quality, and ROI insights for autonomous engineering agents.
        </p>
      </section>

      <section className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setPeriod(option)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              period === option
                ? "bg-cyan text-black"
                : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/60 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.tasksCompleted.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Average Time Saved Per Task</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.avgTimeSaved.toFixed(1)} min</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Cost Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{currency(overview.costSavings)}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>Cost Per Task Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Model API Cost</span>
                <span className="font-medium">{currency(overview.modelCostPerTask)}</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-cyan"
                  style={{ width: `${(overview.modelCostPerTask / maxUnitCost) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Estimated Human Labor Cost</span>
                <span className="font-medium">{currency(overview.humanCostPerTask)}</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-purple"
                  style={{ width: `${(overview.humanCostPerTask / maxUnitCost) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Rework Rate", value: overview.avgReworkRate, invert: true },
              { label: "Test Pass Rate", value: overview.avgPassRate },
              { label: "First-Attempt Success Rate", value: overview.avgFirstAttempt },
            ].map((metric) => {
              const normalized = metric.invert ? Math.max(0, 100 - metric.value) : metric.value;
              return (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-medium">{metric.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${normalized}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="bg-card/60 border-white/10 overflow-hidden">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Agent Leaderboard</CardTitle>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "tasksCompleted", label: "Tasks Completed" },
                { key: "costEfficiency", label: "Cost Efficiency" },
                { key: "qualityScore", label: "Quality Score" },
                { key: "uptime", label: "Uptime" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSortKey(option.key as SortKey)}
                  className={`px-3 py-1.5 rounded-md text-xs border ${
                    sortKey === option.key
                      ? "bg-cyan text-black border-cyan"
                      : "border-white/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Agent</th>
                    <th className="text-left px-4 py-3">Tasks</th>
                    <th className="text-left px-4 py-3">Cost Efficiency</th>
                    <th className="text-left px-4 py-3">Quality Score</th>
                    <th className="text-left px-4 py-3">Uptime</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAgents.map((agent) => (
                    <tr key={agent.slug} className="border-t border-white/10">
                      <td className="px-4 py-3">
                        <Link
                          href={`/productivity/${agent.slug}`}
                          className="font-semibold hover:text-cyan transition-colors"
                        >
                          <span className="mr-2" aria-hidden>
                            {agent.avatar}
                          </span>
                          {agent.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{agent.periods[period].tasksCompleted}</td>
                      <td className="px-4 py-3">{agent.periods[period].costEfficiency.toFixed(1)}x</td>
                      <td className="px-4 py-3">{agent.periods[period].qualityScore.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-white/15 bg-white/5">
                          {agent.uptime.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
