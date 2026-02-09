/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { getMcpHealthServers, getMcpHealthSummary } from "@/lib/mcpHealth";
import { McpHealthDashboardClient } from "@/app/mcp/health/mcp-health-dashboard-client";

export const metadata: Metadata = {
  title: "MCP Server Health Dashboard | forAgents.dev",
  description: "Live reliability view of MCP servers with uptime, latency, incidents, and compatibility.",
};

export default function McpHealthDashboardPage() {
  const servers = getMcpHealthServers();
  const summary = getMcpHealthSummary(servers);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <Link href="/mcp" className="text-sm text-cyan-400 hover:underline">
          ← Back to MCP Hub
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white">MCP Server Health Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Reliability snapshot for active MCP servers across dev tools, cloud, productivity, and data categories.
            </p>
          </div>
          <a
            href="/api/mcp-health"
            className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800/50"
          >
            /api/mcp-health
          </a>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-5 lg:col-span-2">
            <p className="text-xs uppercase tracking-wider text-cyan-300">Overall ecosystem health score</p>
            <p className="mt-2 text-5xl font-black text-white">{summary.ecosystemHealthScore}</p>
            <p className="mt-2 text-xs text-cyan-100/70">Generated {new Date(summary.generatedAt).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
            <p className="text-xs text-slate-400">Operational</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">{summary.byStatus.operational}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
            <p className="text-xs text-slate-400">Degraded</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{summary.byStatus.degraded}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5">
            <p className="text-xs text-slate-400">Outage</p>
            <p className="mt-2 text-3xl font-bold text-rose-300">{summary.byStatus.outage}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/35 p-4 text-sm text-slate-300">
            Avg uptime: <span className="font-mono text-white">{summary.avgUptimePercent}%</span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/35 p-4 text-sm text-slate-300">
            Avg latency: <span className="font-mono text-white">{summary.avgLatencyMs}ms</span>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/35 p-4 text-sm text-slate-300">
            Servers tracked: <span className="font-mono text-white">{summary.totalServers}</span>
          </div>
        </div>

        <div className="mt-10">
          <McpHealthDashboardClient servers={servers} />
        </div>
      </div>
    </div>
  );
}
