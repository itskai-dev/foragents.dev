"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HistoryRun {
  run: number;
  p50: number;
  requestsPerSec: number;
  successRate: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSec: number;
    maxConcurrent: number;
  };
  reliability: {
    successRate: number;
    errorRate: number;
    uptime: number;
  };
  resources: {
    avgMemoryMB: number;
    peakMemoryMB: number;
    avgCpu: number;
  };
  history: HistoryRun[];
}

interface Environment {
  hardware: string;
  model: string;
  dateRun: string;
  testDuration: string;
  totalRequests: number;
}

interface BenchmarksData {
  environment: Environment;
  skills: Skill[];
}

interface BenchmarksClientProps {
  data: BenchmarksData;
}

type SortKey = "name" | "p50" | "p95" | "p99" | "requestsPerSec" | "successRate" | "avgMemoryMB";
type SortDirection = "asc" | "desc";

function LatencyBarChart({ p50, p95, p99, maxValue }: { p50: number; p95: number; p99: number; maxValue: number }) {
  const p50Width = (p50 / maxValue) * 100;
  const p95Width = (p95 / maxValue) * 100;
  const p99Width = (p99 / maxValue) * 100;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-8">p50</span>
        <div className="flex-1 bg-card/50 rounded-sm h-4 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#06D6A0] to-[#06D6A0]/80 rounded-sm transition-all"
            style={{ width: `${p50Width}%` }}
          />
        </div>
        <span className="text-xs font-mono w-12 text-right">{p50}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-8">p95</span>
        <div className="flex-1 bg-card/50 rounded-sm h-4 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-500/80 rounded-sm transition-all"
            style={{ width: `${p95Width}%` }}
          />
        </div>
        <span className="text-xs font-mono w-12 text-right">{p95}ms</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-8">p99</span>
        <div className="flex-1 bg-card/50 rounded-sm h-4 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-500/80 rounded-sm transition-all"
            style={{ width: `${p99Width}%` }}
          />
        </div>
        <span className="text-xs font-mono w-12 text-right">{p99}ms</span>
      </div>
    </div>
  );
}

function HistorySparkline({ history }: { history: HistoryRun[] }) {
  const values = history.map(h => h.p50);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-0.5 h-8">
      {history.map((run, idx) => {
        const height = ((run.p50 - min) / range) * 100;
        const isImproving = idx > 0 && run.p50 < history[idx - 1].p50;
        return (
          <div
            key={run.run}
            className="flex-1 rounded-t-sm transition-all relative group"
            style={{
              height: `${Math.max(height, 10)}%`,
              backgroundColor: isImproving ? '#06D6A0' : '#8B5CF6',
            }}
            title={`Run ${run.run}: ${run.p50}ms`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-card border border-white/10 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Run {run.run}: {run.p50}ms
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricBadge({ value, suffix = "", threshold = { good: 99, warning: 95 } }: { value: number; suffix?: string; threshold?: { good: number; warning: number } }) {
  const color = value >= threshold.good 
    ? "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30" 
    : value >= threshold.warning 
    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" 
    : "bg-red-500/10 text-red-500 border-red-500/30";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${color}`}>
      {value}{suffix}
    </span>
  );
}

export function BenchmarksClient({ data }: BenchmarksClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("p50");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(data.skills.map(s => s.category));
    return ["all", ...Array.from(cats).sort()];
  }, [data.skills]);

  const maxLatency = useMemo(() => {
    return Math.max(...data.skills.map(s => s.latency.p99));
  }, [data.skills]);

  const filteredAndSorted = useMemo(() => {
    let result = data.skills;

    if (categoryFilter !== "all") {
      result = result.filter(s => s.category === categoryFilter);
    }

    result = [...result].sort((a, b) => {
      let aVal: number;
      let bVal: number;

      if (sortKey === "name") {
        return sortDirection === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }

      switch (sortKey) {
        case "p50":
          aVal = a.latency.p50;
          bVal = b.latency.p50;
          break;
        case "p95":
          aVal = a.latency.p95;
          bVal = b.latency.p95;
          break;
        case "p99":
          aVal = a.latency.p99;
          bVal = b.latency.p99;
          break;
        case "requestsPerSec":
          aVal = a.throughput.requestsPerSec;
          bVal = b.throughput.requestsPerSec;
          break;
        case "successRate":
          aVal = a.reliability.successRate;
          bVal = b.reliability.successRate;
          break;
        case "avgMemoryMB":
          aVal = a.resources.avgMemoryMB;
          bVal = b.resources.avgMemoryMB;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [data.skills, categoryFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection(key === "successRate" || key === "requestsPerSec" ? "desc" : "asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <span className="text-muted-foreground/50 ml-1">⇅</span>;
    }
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Performance Benchmarks
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Comprehensive performance metrics for top skills across latency, throughput, and reliability
          </p>

          {/* Environment Info */}
          <div className="inline-flex flex-wrap gap-3 text-sm">
            <Badge variant="outline" className="bg-card/30 border-white/10">
              <span className="text-muted-foreground mr-1">Hardware:</span> {data.environment.hardware}
            </Badge>
            <Badge variant="outline" className="bg-card/30 border-white/10">
              <span className="text-muted-foreground mr-1">Model:</span> {data.environment.model}
            </Badge>
            <Badge variant="outline" className="bg-card/30 border-white/10">
              <span className="text-muted-foreground mr-1">Date:</span> {data.environment.dateRun}
            </Badge>
            <Badge variant="outline" className="bg-card/30 border-white/10">
              <span className="text-muted-foreground mr-1">Duration:</span> {data.environment.testDuration}
            </Badge>
            <Badge variant="outline" className="bg-card/30 border-white/10">
              <span className="text-muted-foreground mr-1">Total Requests:</span> {data.environment.totalRequests.toLocaleString()}
            </Badge>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">FILTER BY CATEGORY</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "bg-card/30 border border-white/10 text-foreground hover:bg-card/50"
                }`}
              >
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Benchmarks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSorted.map(skill => (
            <Card
              key={skill.id}
              className={`bg-card/20 border transition-all cursor-pointer ${
                selectedSkill?.id === skill.id
                  ? "border-[#06D6A0] shadow-lg shadow-[#06D6A0]/10"
                  : "border-white/10 hover:border-white/20"
              }`}
              onClick={() => setSelectedSkill(skill)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-xl mb-1">{skill.name}</CardTitle>
                    <Badge variant="outline" className="text-xs bg-card/50 border-white/20">
                      {skill.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Latency */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="text-[#06D6A0]">⚡</span> Latency
                  </h3>
                  <LatencyBarChart 
                    p50={skill.latency.p50} 
                    p95={skill.latency.p95} 
                    p99={skill.latency.p99}
                    maxValue={maxLatency}
                  />
                </div>

                {/* Throughput & Reliability */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Throughput</h4>
                    <div className="space-y-1">
                      <MetricBadge 
                        value={skill.throughput.requestsPerSec} 
                        suffix=" req/s"
                        threshold={{ good: 100, warning: 50 }}
                      />
                      <div className="text-xs text-muted-foreground">
                        Max: {skill.throughput.maxConcurrent} concurrent
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Reliability</h4>
                    <div className="space-y-1">
                      <MetricBadge value={skill.reliability.successRate} suffix="%" />
                      <div className="text-xs text-muted-foreground">
                        Error: {skill.reliability.errorRate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Resource Usage</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-card/30 rounded px-2 py-1.5">
                      <div className="text-muted-foreground">Avg Memory</div>
                      <div className="font-mono">{skill.resources.avgMemoryMB}MB</div>
                    </div>
                    <div className="bg-card/30 rounded px-2 py-1.5">
                      <div className="text-muted-foreground">Peak Memory</div>
                      <div className="font-mono">{skill.resources.peakMemoryMB}MB</div>
                    </div>
                    <div className="bg-card/30 rounded px-2 py-1.5">
                      <div className="text-muted-foreground">Avg CPU</div>
                      <div className="font-mono">{skill.resources.avgCpu}%</div>
                    </div>
                  </div>
                </div>

                {/* Historical Trend */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    Historical Trend (Last 5 Runs)
                  </h4>
                  <HistorySparkline history={skill.history} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No benchmarks found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Detailed Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Skill <SortIcon column="name" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("p50")}
                >
                  p50 (ms) <SortIcon column="p50" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("p95")}
                >
                  p95 (ms) <SortIcon column="p95" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("p99")}
                >
                  p99 (ms) <SortIcon column="p99" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("requestsPerSec")}
                >
                  Req/Sec <SortIcon column="requestsPerSec" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("successRate")}
                >
                  Success % <SortIcon column="successRate" />
                </th>
                <th
                  className="text-right py-3 px-4 font-semibold cursor-pointer hover:bg-card/20 transition-colors"
                  onClick={() => handleSort("avgMemoryMB")}
                >
                  Avg Mem (MB) <SortIcon column="avgMemoryMB" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map(skill => (
                <tr
                  key={skill.id}
                  className="border-b border-white/5 hover:bg-card/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedSkill(skill)}
                >
                  <td className="py-3 px-4 font-medium">{skill.name}</td>
                  <td className="py-3 px-4 text-right font-mono">{skill.latency.p50}</td>
                  <td className="py-3 px-4 text-right font-mono">{skill.latency.p95}</td>
                  <td className="py-3 px-4 text-right font-mono">{skill.latency.p99}</td>
                  <td className="py-3 px-4 text-right font-mono">{skill.throughput.requestsPerSec}</td>
                  <td className="py-3 px-4 text-right font-mono">{skill.reliability.successRate}%</td>
                  <td className="py-3 px-4 text-right font-mono">{skill.resources.avgMemoryMB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Legend */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Metrics Explained</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Latency Percentiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong className="text-[#06D6A0]">p50:</strong> Median response time (50% of requests faster)</div>
              <div><strong className="text-yellow-500">p95:</strong> 95th percentile (95% of requests faster)</div>
              <div><strong className="text-red-500">p99:</strong> 99th percentile (99% of requests faster)</div>
            </CardContent>
          </Card>

          <Card className="bg-card/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Reliability Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Success Rate:</strong> Percentage of successful requests</div>
              <div><strong>Error Rate:</strong> Percentage of failed requests</div>
              <div><strong>Uptime:</strong> System availability during test period</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
