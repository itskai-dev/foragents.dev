"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { McpHealthCategory, McpHealthServer } from "@/lib/mcpHealth";

const categories: Array<"all" | McpHealthCategory> = ["all", "dev tools", "cloud", "productivity", "data"];

function statusStyles(status: McpHealthServer["status"]) {
  if (status === "operational") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }
  if (status === "degraded") {
    return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
  return "bg-rose-500/15 text-rose-300 border-rose-500/30";
}

function latencyColor(latency: number) {
  if (latency <= 220) return "bg-emerald-400";
  if (latency <= 420) return "bg-amber-400";
  return "bg-rose-400";
}

export function McpHealthDashboardClient({ servers }: { servers: McpHealthServer[] }) {
  const [activeCategory, setActiveCategory] = useState<"all" | McpHealthCategory>("all");

  const filteredServers = useMemo(() => {
    if (activeCategory === "all") return servers;
    return servers.filter((server) => server.category === activeCategory);
  }, [servers, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-mono transition-colors " +
                (active
                  ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                  : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500")
              }
              aria-pressed={active}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredServers.map((server) => (
          <Link
            key={server.id}
            href={`/mcp/health/${server.slug}`}
            className="rounded-2xl border border-slate-700 bg-slate-900/35 p-5 transition hover:border-cyan-400/30 hover:bg-slate-900/55"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{server.name}</h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{server.category}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles(server.status)}`}>
                {server.status}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-300">{server.description}</p>

            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Average latency</span>
                  <span className="font-mono text-slate-200">{server.avgLatencyMs}ms</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${latencyColor(server.avgLatencyMs)}`}
                    style={{ width: `${Math.max(10, Math.min(100, Math.round((500 / Math.max(server.avgLatencyMs, 80)) * 20)))}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300">
                  {server.sla.uptime}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300">
                  {server.sla.latency}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Last checked: {new Date(server.lastChecked).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
