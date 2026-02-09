/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AgentBenchmarksData, CategoryId } from "@/types/agent-benchmarks";

type LeaderboardAgent = AgentBenchmarksData["agents"][number] & {
  compositeScore: number;
};

interface BenchmarksClientProps {
  data: AgentBenchmarksData;
}

function scoreBarWidth(score: number) {
  return `${Math.max(5, Math.min(100, score))}%`;
}

export function BenchmarksClient({ data }: BenchmarksClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | CategoryId>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");

  const providers = useMemo(
    () => ["all", ...new Set(data.agents.map((agent) => agent.provider))],
    [data.agents]
  );

  const frameworks = useMemo(
    () => ["all", ...new Set(data.agents.map((agent) => agent.framework))],
    [data.agents]
  );

  const topScorers = useMemo(() => {
    return data.categories.reduce<Record<string, { name: string; score: number }>>((acc, category) => {
      const sorted = [...data.agents].sort(
        (a, b) => b.scores[category.id] - a.scores[category.id]
      );
      acc[category.id] = { name: sorted[0].name, score: sorted[0].scores[category.id] };
      return acc;
    }, {});
  }, [data.agents, data.categories]);

  const leaderboard: LeaderboardAgent[] = useMemo(() => {
    const filtered = data.agents.filter((agent) => {
      if (selectedProvider !== "all" && agent.provider !== selectedProvider) {
        return false;
      }

      if (selectedFramework !== "all" && agent.framework !== selectedFramework) {
        return false;
      }

      return true;
    });

    return filtered
      .map((agent) => {
        const values =
          selectedCategory === "all"
            ? Object.values(agent.scores)
            : [agent.scores[selectedCategory]];

        const compositeScore = Number(
          (values.reduce((sum, score) => sum + score, 0) / values.length).toFixed(1)
        );

        return { ...agent, compositeScore };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore);
  }, [data.agents, selectedCategory, selectedFramework, selectedProvider]);

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Agent Benchmark Suite</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Standardized evaluation of agent capabilities across reasoning, tool use, code generation,
            memory & context management, and multi-agent collaboration so each runner's strengths are comparable.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Dataset v{data.version} · Updated {data.updatedAt}
          </p>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((category) => {
            const topScorer = topScorers[category.id];
            const totalTests = category.testCases.length;

            return (
              <article
                key={category.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">{category.name}</h2>
                  <Link
                    href={`/benchmarks/${category.id}`}
                    className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    View details →
                  </Link>
                </div>
                <p className="text-sm text-slate-300">{category.description}</p>
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <p>Test cases: {totalTests}</p>
                  <p>
                    Difficulty: E {category.difficultyDistribution.easy} · M {category.difficultyDistribution.medium}
                    · H {category.difficultyDistribution.hard}
                  </p>
                  <p>
                    Top scorer: <span className="font-semibold text-slate-100">{topScorer.name}</span> ({topScorer.score})
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="mb-3 text-base font-semibold">Leaderboard Filters</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs text-slate-300">
              Category
              <select
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value as "all" | CategoryId)}
              >
                <option value="all">All categories (composite)</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-300">
              Model Provider
              <select
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={selectedProvider}
                onChange={(event) => setSelectedProvider(event.target.value)}
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider === "all" ? "All providers" : provider}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-300">
              Agent Framework
              <select
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={selectedFramework}
                onChange={(event) => setSelectedFramework(event.target.value)}
              >
                {frameworks.map((framework) => (
                  <option key={framework} value={framework}>
                    {framework === "all" ? "All frameworks" : framework}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Framework</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Composite Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((agent, index) => (
                <tr key={agent.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold text-cyan-300">#{index + 1}</td>
                  <td className="px-4 py-3">{agent.name}</td>
                  <td className="px-4 py-3 text-slate-300">{agent.provider}</td>
                  <td className="px-4 py-3 text-slate-300">{agent.framework}</td>
                  <td className="px-4 py-3 text-slate-300">{agent.model}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-right font-semibold">{agent.compositeScore}</span>
                      <div className="h-2.5 flex-1 rounded-full bg-slate-800">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: scoreBarWidth(agent.compositeScore) }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 && (
            <p className="px-4 py-5 text-sm text-slate-300">No agents match the selected filters.</p>
          )}
        </section>
      </main>
    </div>
  );
}
