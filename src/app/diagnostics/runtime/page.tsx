"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, Clock, Zap, AlertCircle, CheckCircle } from "lucide-react";

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: number;
}

interface ToolCallStats {
  tool: string;
  calls: number;
  success: number;
  failures: number;
  avgLatency: number;
}

interface LatencyPercentile {
  percentile: string;
  value: number;
}

// Sample data - in production, this would come from an API
const healthMetrics: HealthMetric[] = [
  { name: "Memory Usage", value: 67, unit: "%", status: "healthy", threshold: 80 },
  { name: "Context Window", value: 82, unit: "%", status: "warning", threshold: 85 },
  { name: "CPU Usage", value: 45, unit: "%", status: "healthy", threshold: 75 },
  { name: "API Rate Limit", value: 23, unit: "%", status: "healthy", threshold: 90 },
];

const toolCallStats: ToolCallStats[] = [
  { tool: "web_search", calls: 1247, success: 1198, failures: 49, avgLatency: 342 },
  { tool: "exec", calls: 892, success: 876, failures: 16, avgLatency: 156 },
  { tool: "read", calls: 2341, success: 2340, failures: 1, avgLatency: 12 },
  { tool: "write", calls: 567, success: 565, failures: 2, avgLatency: 28 },
  { tool: "browser", calls: 423, success: 387, failures: 36, avgLatency: 1823 },
];

const latencyPercentiles: LatencyPercentile[] = [
  { percentile: "p50", value: 145 },
  { percentile: "p75", value: 312 },
  { percentile: "p90", value: 678 },
  { percentile: "p95", value: 1234 },
  { percentile: "p99", value: 2456 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "healthy":
      return "text-green-500";
    case "warning":
      return "text-yellow-500";
    case "critical":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case "critical":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Activity className="w-5 h-5 text-gray-500" />;
  }
};

export default function RuntimeHealthPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Runtime <span className="aurora-text">Health</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Real-time agent health indicators, tool call success rates, and latency metrics.
          </p>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {healthMetrics.map((metric, idx) => (
            <Card key={idx} className="bg-[#0f0f0f] border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.name}
                  </CardTitle>
                  {getStatusIcon(metric.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                    <span className="text-muted-foreground">{metric.unit}</span>
                  </div>
                  
                  {/* Pure CSS Progress Bar */}
                  <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full transition-all ${
                        metric.status === "healthy"
                          ? "bg-green-500"
                          : metric.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${metric.value}%` }}
                    />
                    {/* Threshold indicator */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/40"
                      style={{ left: `${metric.threshold}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Threshold: {metric.threshold}{metric.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tool Call Success Rates */}
        <Card className="bg-[#0f0f0f] border-white/10 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <Zap className="w-5 h-5 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-xl">Tool Call Success Rates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolCallStats.map((stat, idx) => {
                const successRate = ((stat.success / stat.calls) * 100).toFixed(1);
                const isHealthy = parseFloat(successRate) >= 95;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono text-[#06D6A0]">
                          {stat.tool}
                        </code>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isHealthy ? "border-green-500/50 text-green-500" : "border-yellow-500/50 text-yellow-500"
                          }`}
                        >
                          {successRate}% success
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{stat.calls} calls</span>
                        <span className="text-green-500">{stat.success} ✓</span>
                        <span className="text-red-500">{stat.failures} ✗</span>
                        <span>{stat.avgLatency}ms avg</span>
                      </div>
                    </div>
                    
                    {/* Pure CSS Bar Chart */}
                    <div className="relative w-full h-8 bg-white/5 rounded overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-green-500/80 transition-all"
                        style={{ width: `${successRate}%` }}
                      />
                      <div
                        className="absolute top-0 right-0 h-full bg-red-500/80 transition-all"
                        style={{ width: `${((stat.failures / stat.calls) * 100).toFixed(1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Latency Percentiles */}
        <Card className="bg-[#0f0f0f] border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <Clock className="w-5 h-5 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-xl">Latency Percentiles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latencyPercentiles.map((percentile, idx) => {
                const maxValue = Math.max(...latencyPercentiles.map(p => p.value));
                const widthPercent = (percentile.value / maxValue) * 100;
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground uppercase">
                        {percentile.percentile}
                      </span>
                      <span className="text-sm font-mono">
                        {percentile.value}ms
                      </span>
                    </div>
                    
                    {/* Pure CSS Horizontal Bar */}
                    <div className="relative w-full h-6 bg-white/5 rounded overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#06D6A0] to-[#06D6A0]/60 transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Reading percentiles:</strong> p50 means 50% of requests are faster than this value. 
                p99 indicates the worst-case latency for 99% of requests.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Context Window Visualization */}
        <Card className="bg-[#0f0f0f] border-white/10 mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#06D6A0]/10">
                <Cpu className="w-5 h-5 text-[#06D6A0]" />
              </div>
              <CardTitle className="text-xl">Context Window Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current usage</span>
                <span className="font-mono">82,400 / 100,000 tokens</span>
              </div>
              
              {/* Pure CSS Stacked Bar */}
              <div className="relative w-full h-12 bg-white/5 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500/80 flex items-center justify-center text-xs font-semibold"
                  style={{ width: "45%" }}
                  title="System prompts"
                >
                  System
                </div>
                <div
                  className="absolute top-0 h-full bg-green-500/80 flex items-center justify-center text-xs font-semibold"
                  style={{ left: "45%", width: "25%" }}
                  title="Conversation history"
                >
                  History
                </div>
                <div
                  className="absolute top-0 h-full bg-purple-500/80 flex items-center justify-center text-xs font-semibold"
                  style={{ left: "70%", width: "12%" }}
                  title="Tool outputs"
                >
                  Tools
                </div>
                <div
                  className="absolute top-0 h-full bg-white/5"
                  style={{ left: "82%", width: "18%" }}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/80 rounded" />
                  <span className="text-muted-foreground">System (45k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500/80 rounded" />
                  <span className="text-muted-foreground">History (25k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500/80 rounded" />
                  <span className="text-muted-foreground">Tools (12.4k)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white/5 rounded" />
                  <span className="text-muted-foreground">Available (17.6k)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
