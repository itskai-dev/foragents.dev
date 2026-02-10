"use client";

import { useEffect, useMemo, useState } from "react";

type PerformanceCategory = "caching" | "scaling" | "tokens" | "general";

interface PerformanceBenchmark {
  id: string;
  metric: string;
  value: number;
  unit: string;
  category: PerformanceCategory;
  agentHandle: string;
  measuredAt: string;
  environment: string;
}

interface PerformanceApiResponse {
  benchmarks: PerformanceBenchmark[];
  count: number;
}

interface PerformanceBenchmarksPanelProps {
  category?: PerformanceCategory;
  title?: string;
  description?: string;
}

function formatMetricLabel(metric: string): string {
  return metric
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatValue(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  if (value < 0.01) {
    return value.toFixed(4);
  }

  if (value < 1) {
    return value.toFixed(3);
  }

  return value.toFixed(1);
}

export function PerformanceBenchmarksPanel({
  category,
  title = "Live Performance Benchmarks",
  description = "Recent measurements from the persistent benchmark dataset.",
}: PerformanceBenchmarksPanelProps) {
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBenchmarks() {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (category) {
        params.set("category", category);
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/performance?${queryString}` : "/api/performance";

      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch benchmarks");
        }

        const payload = (await response.json()) as PerformanceApiResponse;
        if (isMounted) {
          setBenchmarks(payload.benchmarks ?? []);
        }
      } catch {
        if (isMounted) {
          setBenchmarks([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBenchmarks();

    return () => {
      isMounted = false;
    };
  }, [category]);

  const stats = useMemo(() => {
    const agents = new Set(benchmarks.map((item) => item.agentHandle.toLowerCase()));
    const environments = new Set(benchmarks.map((item) => item.environment.toLowerCase()));
    const latestTimestamp = benchmarks
      .map((item) => Date.parse(item.measuredAt))
      .filter((value) => !Number.isNaN(value))
      .sort((a, b) => b - a)[0];

    return {
      benchmarkCount: benchmarks.length,
      uniqueAgents: agents.size,
      environments: environments.size,
      latestMeasurement: latestTimestamp
        ? new Date(latestTimestamp).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "N/A",
    };
  }, [benchmarks]);

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-slate-400 mb-1">Benchmarks</div>
          <div className="text-2xl font-bold text-white">{isLoading ? "..." : stats.benchmarkCount}</div>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-slate-400 mb-1">Agents</div>
          <div className="text-2xl font-bold text-white">{isLoading ? "..." : stats.uniqueAgents}</div>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-slate-400 mb-1">Environments</div>
          <div className="text-2xl font-bold text-white">{isLoading ? "..." : stats.environments}</div>
        </div>
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-slate-400 mb-1">Latest</div>
          <div className="text-sm md:text-base font-bold text-white pt-1">{isLoading ? "..." : stats.latestMeasurement}</div>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-slate-400 text-sm">Loading benchmarks...</div>
        ) : benchmarks.length === 0 ? (
          <div className="text-slate-400 text-sm">No benchmarks found for this category yet.</div>
        ) : (
          benchmarks.map((benchmark) => (
            <div
              key={benchmark.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-black/20 border border-white/10 rounded-lg p-4"
            >
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500 mb-1">Metric</div>
                <div className="text-white font-medium">{formatMetricLabel(benchmark.metric)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Value</div>
                <div className="text-blue-400 font-semibold">{formatValue(benchmark.value)} {benchmark.unit}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Agent</div>
                <div className="text-slate-200">{benchmark.agentHandle}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Environment</div>
                <div className="text-slate-200">{benchmark.environment}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
