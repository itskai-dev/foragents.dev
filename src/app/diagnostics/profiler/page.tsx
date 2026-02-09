"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, Database, Cpu, HardDrive } from "lucide-react";

interface ProfileEntry {
  name: string;
  type: "thinking" | "tool" | "waiting" | "context" | "other";
  startMs: number;
  durationMs: number;
  details?: string;
}

interface TimeBreakdown {
  category: string;
  time: number;
  percentage: number;
  color: string;
}

// Sample profiling data - in production, this would come from actual agent execution traces
const profileEntries: ProfileEntry[] = [
  { name: "Context Loading", type: "context", startMs: 0, durationMs: 120, details: "Load system prompts, memory, tools" },
  { name: "Thinking (Turn 1)", type: "thinking", startMs: 120, durationMs: 450, details: "Initial problem analysis" },
  { name: "web_search", type: "tool", startMs: 570, durationMs: 340, details: "Search for 'Next.js performance tips'" },
  { name: "Thinking (Turn 2)", type: "thinking", startMs: 910, durationMs: 380, details: "Process search results" },
  { name: "read", type: "tool", startMs: 1290, durationMs: 12, details: "Read package.json" },
  { name: "exec", type: "tool", startMs: 1302, durationMs: 156, details: "npm run build" },
  { name: "Waiting (Rate Limit)", type: "waiting", startMs: 1458, durationMs: 500, details: "429 rate limit, backoff" },
  { name: "Thinking (Turn 3)", type: "thinking", startMs: 1958, durationMs: 520, details: "Analyze build output" },
  { name: "write", type: "tool", startMs: 2478, durationMs: 28, details: "Write next.config.ts" },
  { name: "browser", type: "tool", startMs: 2506, durationMs: 1823, details: "Open https://localhost:3000" },
  { name: "Context Refresh", type: "context", startMs: 4329, durationMs: 95, details: "Update conversation history" },
  { name: "Thinking (Turn 4)", type: "thinking", startMs: 4424, durationMs: 620, details: "Final response generation" },
];

const getTypeColor = (type: string): string => {
  switch (type) {
    case "thinking":
      return "bg-blue-500";
    case "tool":
      return "bg-green-500";
    case "waiting":
      return "bg-yellow-500";
    case "context":
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "thinking":
      return <Cpu className="w-4 h-4" />;
    case "tool":
      return <Zap className="w-4 h-4" />;
    case "waiting":
      return <Clock className="w-4 h-4" />;
    case "context":
      return <Database className="w-4 h-4" />;
    default:
      return <HardDrive className="w-4 h-4" />;
  }
};

export default function ProfilerPage() {
  // Calculate total time and breakdown
  const totalTimeMs = Math.max(...profileEntries.map(e => e.startMs + e.durationMs));
  
  const timeBreakdown: TimeBreakdown[] = [
    {
      category: "Thinking",
      time: profileEntries.filter(e => e.type === "thinking").reduce((sum, e) => sum + e.durationMs, 0),
      percentage: 0,
      color: "bg-blue-500",
    },
    {
      category: "Tool Calls",
      time: profileEntries.filter(e => e.type === "tool").reduce((sum, e) => sum + e.durationMs, 0),
      percentage: 0,
      color: "bg-green-500",
    },
    {
      category: "Waiting",
      time: profileEntries.filter(e => e.type === "waiting").reduce((sum, e) => sum + e.durationMs, 0),
      percentage: 0,
      color: "bg-yellow-500",
    },
    {
      category: "Context Loading",
      time: profileEntries.filter(e => e.type === "context").reduce((sum, e) => sum + e.durationMs, 0),
      percentage: 0,
      color: "bg-purple-500",
    },
  ];
  
  // Calculate percentages
  timeBreakdown.forEach(item => {
    item.percentage = (item.time / totalTimeMs) * 100;
  });

  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Performance <span className="aurora-text">Profiler</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Breakdown of where agent time goes: thinking, tool calls, waiting, and context loading.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-[#0f0f0f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold mt-1">{(totalTimeMs / 1000).toFixed(2)}s</p>
              </div>
            </CardContent>
          </Card>

          {timeBreakdown.map((item, idx) => (
            <Card key={idx} className="bg-[#0f0f0f] border-white/10">
              <CardContent className="pt-6">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <p className="text-2xl font-bold mt-1">{(item.time / 1000).toFixed(2)}s</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.percentage.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Time Breakdown Chart */}
        <Card className="bg-[#0f0f0f] border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Stacked Bar Chart */}
              <div className="relative w-full h-16 bg-white/5 rounded-lg overflow-hidden flex">
                {timeBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`h-full ${item.color} flex items-center justify-center text-sm font-semibold transition-all hover:brightness-110 cursor-pointer`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.category}: ${(item.time / 1000).toFixed(2)}s (${item.percentage.toFixed(1)}%)`}
                  >
                    {item.percentage > 10 && (
                      <span className="text-white drop-shadow">
                        {item.percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                {timeBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-4 h-4 ${item.color} rounded`} />
                    <span className="text-muted-foreground">
                      {item.category} ({(item.time / 1000).toFixed(2)}s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waterfall Visualization */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <CardTitle className="text-xl">Execution Waterfall</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Timeline visualization similar to browser dev tools. Each bar shows timing and duration.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Timeline ruler */}
              <div className="relative w-full h-8 border-b border-white/10">
                <div className="absolute top-0 left-0 text-xs text-muted-foreground">0ms</div>
                <div className="absolute top-0 left-1/4 text-xs text-muted-foreground">
                  {(totalTimeMs / 4).toFixed(0)}ms
                </div>
                <div className="absolute top-0 left-1/2 text-xs text-muted-foreground">
                  {(totalTimeMs / 2).toFixed(0)}ms
                </div>
                <div className="absolute top-0 left-3/4 text-xs text-muted-foreground">
                  {(totalTimeMs * 3 / 4).toFixed(0)}ms
                </div>
                <div className="absolute top-0 right-0 text-xs text-muted-foreground">
                  {totalTimeMs.toFixed(0)}ms
                </div>
              </div>

              {/* Waterfall entries */}
              {profileEntries.map((entry, idx) => {
                const leftPercent = (entry.startMs / totalTimeMs) * 100;
                const widthPercent = (entry.durationMs / totalTimeMs) * 100;
                
                return (
                  <div key={idx} className="relative">
                    {/* Entry info */}
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`p-1.5 rounded ${getTypeColor(entry.type)}/10`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{entry.name}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {entry.type}
                          </Badge>
                        </div>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.details}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {entry.durationMs}ms
                      </span>
                    </div>

                    {/* Waterfall bar */}
                    <div className="relative w-full h-8 bg-white/5 rounded overflow-hidden">
                      <div
                        className={`absolute top-0 h-full ${getTypeColor(entry.type)} transition-all hover:brightness-110 cursor-pointer flex items-center px-2`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        title={`${entry.name}: ${entry.durationMs}ms (${entry.startMs}ms - ${entry.startMs + entry.durationMs}ms)`}
                      >
                        {widthPercent > 5 && (
                          <span className="text-xs font-semibold text-white truncate">
                            {entry.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Reading the waterfall:</strong> Each bar's position shows when it started, 
                and its length shows how long it took. Gaps between bars indicate idle time or waiting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="bg-[#0f0f0f] border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-500">High waiting time detected</p>
                  <p className="text-muted-foreground mt-1">
                    500ms spent waiting for rate limit recovery. Consider implementing request queuing 
                    or upgrading API tier.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <Cpu className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-500">Thinking time: {(timeBreakdown[0].time / 1000).toFixed(2)}s ({timeBreakdown[0].percentage.toFixed(1)}%)</p>
                  <p className="text-muted-foreground mt-1">
                    This is model inference time. To reduce: use a faster model, shorten prompts, 
                    or reduce output length.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
                <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-500">Browser tool is slowest</p>
                  <p className="text-muted-foreground mt-1">
                    1.82s for browser automation. Consider headless mode, reduce wait times, 
                    or cache frequent page loads.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
