/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { benchmarkCategories, type BenchmarkCategory, type BenchmarkEntry } from "@/types/benchmarks";

interface BenchmarksClientProps {
  initialCategory?: BenchmarkCategory;
}

interface ApiResponse {
  benchmarks: BenchmarkEntry[];
  count: number;
}

const categoryLabels: Record<BenchmarkCategory, string> = {
  speed: "Speed",
  accuracy: "Accuracy",
  reliability: "Reliability",
  memory: "Memory",
};

function scoreBarWidth(score: number) {
  return `${Math.max(4, Math.min(100, score))}%`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

export function BenchmarksClient({ initialCategory }: BenchmarksClientProps) {
  const [rows, setRows] = useState<BenchmarkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [skillFilter, setSkillFilter] = useState("");
  const [sort, setSort] = useState<"score" | "date">("score");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [form, setForm] = useState({
    skillSlug: "",
    skillName: "",
    category: initialCategory ?? benchmarkCategories[0],
    score: "",
    version: "v1",
    runDate: new Date().toISOString().slice(0, 10),
    metricsText: '{"latencyMs": 120, "successRate": 99.2}',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const endpoint = initialCategory ? `/api/benchmarks/${initialCategory}` : "/api/benchmarks";
    const query = new URLSearchParams({
      sort,
      order,
    });

    if (skillFilter.trim()) {
      query.set("skill", skillFilter.trim());
    }

    try {
      const response = await fetch(`${endpoint}?${query.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = (await response.json()) as ApiResponse;
      setRows(Array.isArray(data.benchmarks) ? data.benchmarks : []);
    } catch (loadErr) {
      setError(loadErr instanceof Error ? loadErr.message : "Unable to load benchmarks");
    } finally {
      setIsLoading(false);
    }
  }, [initialCategory, order, skillFilter, sort]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const averageScore = useMemo(() => {
    if (!rows.length) {
      return 0;
    }

    const total = rows.reduce((sum, row) => sum + row.score, 0);
    return Number((total / rows.length).toFixed(1));
  }, [rows]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    let metrics: Record<string, number | string | boolean | null> = {};
    try {
      const parsed = JSON.parse(form.metricsText) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        metrics = parsed as Record<string, number | string | boolean | null>;
      } else {
        throw new Error("Metrics must be a JSON object");
      }
    } catch {
      setSubmitError("Metrics must be a valid JSON object.");
      return;
    }

    const payload = {
      skillSlug: form.skillSlug.trim(),
      skillName: form.skillName.trim(),
      category: form.category,
      score: Number(form.score),
      metrics,
      runDate: new Date(`${form.runDate}T00:00:00.000Z`).toISOString(),
      version: form.version.trim(),
    };

    const response = await fetch("/api/benchmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setSubmitError(body.error ?? "Failed to submit benchmark.");
      return;
    }

    setSubmitSuccess("Benchmark submitted successfully.");
    setForm((current) => ({
      ...current,
      skillSlug: "",
      skillName: "",
      score: "",
    }));
    await loadData();
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <section className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Benchmarks</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Real benchmark runs persisted to data/benchmarks.json. Filter by skill, sort by score or date,
            and submit fresh benchmark results directly from this page.
          </p>
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/benchmarks"
            className={`rounded-full border px-3 py-1 text-sm ${
              !initialCategory
                ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                : "border-white/20 text-slate-300 hover:border-cyan-300"
            }`}
          >
            All
          </Link>
          {benchmarkCategories.map((category) => (
            <Link
              key={category}
              href={`/benchmarks/${category}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                initialCategory === category
                  ? "border-cyan-300 bg-cyan-400/20 text-cyan-200"
                  : "border-white/20 text-slate-300 hover:border-cyan-300"
              }`}
            >
              {categoryLabels[category]}
            </Link>
          ))}
        </section>

        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs text-slate-300">
              Skill filter
              <input
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                placeholder="skill name or slug"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
              />
            </label>

            <label className="text-xs text-slate-300">
              Sort by
              <select
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={sort}
                onChange={(event) => setSort(event.target.value as "score" | "date")}
              >
                <option value="score">Score</option>
                <option value="date">Run date</option>
              </select>
            </label>

            <label className="text-xs text-slate-300">
              Order
              <select
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={order}
                onChange={(event) => setOrder(event.target.value as "asc" | "desc")}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Results: {rows.length} · Average score: {averageScore}
          </p>
        </section>

        <section className="mb-10 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3">Skill</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Run Date</th>
                <th className="px-4 py-3">Version</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <p className="font-medium">{entry.skillName}</p>
                    <p className="text-xs text-slate-400">{entry.skillSlug}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-300">{entry.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 text-right font-semibold">{entry.score}</span>
                      <div className="h-2.5 flex-1 rounded-full bg-slate-800">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: scoreBarWidth(entry.score) }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(entry.runDate)}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && rows.length === 0 && (
            <p className="px-4 py-5 text-sm text-slate-300">No benchmark rows match your filters.</p>
          )}
          {isLoading && <p className="px-4 py-5 text-sm text-slate-300">Loading benchmarks...</p>}
          {error && <p className="px-4 py-5 text-sm text-red-300">{error}</p>}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-semibold">Submit Benchmark Result</h2>
          <p className="mt-2 text-sm text-slate-300">
            Submit a benchmark run to persist it in the benchmarks dataset.
          </p>

          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-xs text-slate-300">
              Skill slug
              <input
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.skillSlug}
                onChange={(event) => setForm((current) => ({ ...current, skillSlug: event.target.value }))}
                required
              />
            </label>

            <label className="text-xs text-slate-300">
              Skill name
              <input
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.skillName}
                onChange={(event) => setForm((current) => ({ ...current, skillName: event.target.value }))}
                required
              />
            </label>

            <label className="text-xs text-slate-300">
              Category
              <select
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value as BenchmarkCategory }))
                }
              >
                {benchmarkCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-300">
              Score (0-100)
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.score}
                onChange={(event) => setForm((current) => ({ ...current, score: event.target.value }))}
                required
              />
            </label>

            <label className="text-xs text-slate-300">
              Version
              <input
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.version}
                onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))}
                required
              />
            </label>

            <label className="text-xs text-slate-300">
              Run date
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.runDate}
                onChange={(event) => setForm((current) => ({ ...current, runDate: event.target.value }))}
                required
              />
            </label>

            <label className="text-xs text-slate-300 md:col-span-2">
              Metrics (JSON object)
              <textarea
                className="mt-1 h-28 w-full rounded-md border border-white/15 bg-slate-950 px-2 py-2 text-sm"
                value={form.metricsText}
                onChange={(event) => setForm((current) => ({ ...current, metricsText: event.target.value }))}
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
              >
                Submit result
              </button>
            </div>
          </form>

          {submitError && <p className="mt-3 text-sm text-red-300">{submitError}</p>}
          {submitSuccess && <p className="mt-3 text-sm text-emerald-300">{submitSuccess}</p>}
        </section>
      </main>
    </div>
  );
}
