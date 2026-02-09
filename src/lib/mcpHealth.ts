import healthData from "@/data/mcp-health.json";

export type McpHealthCategory = "dev tools" | "cloud" | "productivity" | "data";
export type McpHealthStatus = "operational" | "degraded" | "outage";
export type CompatibilityStatus = "stable" | "partial" | "unsupported";

export type McpHealthIncident = {
  date: string;
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
  resolved: boolean;
};

export type McpBreakingChange = {
  date: string;
  title: string;
  impact: "low" | "medium" | "high";
  actionRequired: string;
};

export type McpHealthServer = {
  id: string;
  slug: string;
  name: string;
  category: McpHealthCategory;
  description: string;
  status: McpHealthStatus;
  uptimePercent: number;
  avgLatencyMs: number;
  lastChecked: string;
  sla: {
    uptime: string;
    latency: string;
  };
  version: string;
  mcpVersion: string;
  uptime30d: number[];
  responseTime7d: number[];
  compatibility: Record<string, CompatibilityStatus>;
  incidents: McpHealthIncident[];
  breakingChanges: McpBreakingChange[];
};

export function getMcpHealthServers(): McpHealthServer[] {
  return healthData as McpHealthServer[];
}

export function getMcpHealthServerBySlug(slug: string): McpHealthServer | undefined {
  return getMcpHealthServers().find((server) => server.slug === slug);
}

function latencyScore(latency: number): number {
  if (latency <= 120) return 100;
  if (latency <= 200) return 95;
  if (latency <= 300) return 88;
  if (latency <= 450) return 76;
  if (latency <= 700) return 60;
  return 35;
}

function statusScore(status: McpHealthStatus): number {
  if (status === "operational") return 100;
  if (status === "degraded") return 68;
  return 28;
}

function serverHealthScore(server: McpHealthServer): number {
  const weighted =
    server.uptimePercent * 0.72 + latencyScore(server.avgLatencyMs) * 0.18 + statusScore(server.status) * 0.1;
  return Math.max(0, Math.min(100, weighted));
}

export function getMcpHealthSummary(servers: McpHealthServer[]) {
  const score = Math.round(servers.reduce((sum, server) => sum + serverHealthScore(server), 0) / servers.length);
  const byStatus = {
    operational: servers.filter((s) => s.status === "operational").length,
    degraded: servers.filter((s) => s.status === "degraded").length,
    outage: servers.filter((s) => s.status === "outage").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    ecosystemHealthScore: score,
    totalServers: servers.length,
    byStatus,
    avgLatencyMs: Math.round(servers.reduce((sum, server) => sum + server.avgLatencyMs, 0) / servers.length),
    avgUptimePercent: Number(
      (servers.reduce((sum, server) => sum + server.uptimePercent, 0) / servers.length).toFixed(2)
    ),
  };
}
