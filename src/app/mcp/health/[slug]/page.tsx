/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMcpHealthServerBySlug, getMcpHealthServers } from "@/lib/mcpHealth";

type PageProps = {
  params: { slug: string };
};

function statusChip(status: "operational" | "degraded" | "outage") {
  if (status === "operational") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "degraded") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
}

function compatibilityChip(state: "stable" | "partial" | "unsupported") {
  if (state === "stable") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (state === "partial") return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-rose-500/30 bg-rose-500/10 text-rose-300";
}

export async function generateStaticParams() {
  return getMcpHealthServers().map((server) => ({ slug: server.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const server = getMcpHealthServerBySlug(slug);

  if (!server) {
    return {
      title: "MCP Health Detail | forAgents.dev",
    };
  }

  return {
    title: `${server.name} Health | forAgents.dev`,
    description: `Uptime history, latency trends, incidents, and compatibility matrix for ${server.name}.`,
  };
}

export default async function McpServerHealthDetailPage({ params }: PageProps) {
  const { slug } = params;
  const server = getMcpHealthServerBySlug(slug);

  if (!server) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <Link href="/mcp/health" className="text-sm text-cyan-400 hover:underline">
          ← Back to MCP Health Dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{server.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{server.description}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs ${statusChip(server.status)}`}>{server.status}</span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400">Uptime</p>
            <p className="mt-2 text-2xl font-bold text-white">{server.uptimePercent}%</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400">Average latency</p>
            <p className="mt-2 text-2xl font-bold text-white">{server.avgLatencyMs}ms</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400">Server version</p>
            <p className="mt-2 text-2xl font-bold text-white">{server.version}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400">MCP spec</p>
            <p className="mt-2 text-2xl font-bold text-white">{server.mcpVersion}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/35 p-5">
            <h2 className="text-lg font-semibold text-white">30-day uptime history</h2>
            <p className="mt-1 text-xs text-slate-400">Pure CSS chart with daily uptime percentages.</p>
            <div className="mt-4 flex h-44 items-end gap-1 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              {server.uptime30d.map((day, index) => (
                <div key={`${server.slug}-uptime-${index}`} className="group relative flex-1">
                  <div
                    className="w-full rounded-sm bg-cyan-400/80 transition-opacity group-hover:opacity-80"
                    style={{ height: `${Math.max(10, Math.round(day))}%` }}
                    title={`Day ${index + 1}: ${day}%`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/35 p-5">
            <h2 className="text-lg font-semibold text-white">Response time trend</h2>
            <p className="mt-1 text-xs text-slate-400">Last 7 checks in milliseconds.</p>
            <div className="mt-4 space-y-2">
              {server.responseTime7d.map((latency, index) => (
                <div key={`${server.slug}-latency-${index}`}>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>Check {index + 1}</span>
                    <span className="font-mono text-slate-200">{latency}ms</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-violet-400"
                      style={{ width: `${Math.max(8, Math.min(100, Math.round((latency / 1000) * 100)))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/35 p-5">
          <h2 className="text-lg font-semibold text-white">Version compatibility matrix</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-400">
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2">Compatibility</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(server.compatibility).map(([client, state]) => (
                  <tr key={client} className="border-b border-slate-800/70">
                    <td className="py-2 pr-3 text-slate-200">{client}</td>
                    <td className="py-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${compatibilityChip(state)}`}>
                        {state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/35 p-5">
          <h2 className="text-lg font-semibold text-white">Community-reported incidents</h2>
          {server.incidents.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No reported incidents in the current window.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {server.incidents.map((incident) => (
                <article key={`${incident.date}-${incident.title}`} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{incident.title}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] ${
                        incident.severity === "high"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                          : incident.severity === "medium"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-300"
                      }`}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{new Date(incident.date).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-slate-300">{incident.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Status: {incident.resolved ? "Resolved" : "Ongoing"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <h2 className="text-lg font-semibold text-rose-200">Breaking change alerts</h2>
          {server.breakingChanges.length === 0 ? (
            <p className="mt-3 text-sm text-rose-100/80">No active breaking change alerts.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {server.breakingChanges.map((change) => (
                <article key={`${change.date}-${change.title}`} className="rounded-xl border border-rose-500/20 bg-slate-950/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-rose-100">{change.title}</h3>
                    <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-200">
                      {change.impact} impact
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-rose-100/70">{new Date(change.date).toLocaleDateString()}</p>
                  <p className="mt-2 text-sm text-rose-100/90">{change.actionRequired}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
