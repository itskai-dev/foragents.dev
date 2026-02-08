import Link from "next/link";
import { computeAgentHealthMetrics, readHealthEvents } from "@/lib/agentHealth";

export const metadata = {
  title: "Health — forAgents.dev",
  description: "Agent run health and alerting overview",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDuration(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);

  const mm = m % 60;
  const ss = s % 60;
  const hh = h % 24;

  if (d > 0) return `${d}d ${hh}h`;
  if (h > 0) return `${h}h ${mm}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${s}s`;
}

function pct(n: number | null) {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

function StatusPill({ severity, label }: { severity: "green" | "yellow" | "red"; label: string }) {
  const cls =
    severity === "green"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : severity === "yellow"
        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
        : "bg-rose-500/15 text-rose-300 border-rose-500/30";

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${cls}`}>
      <span
        className={`h-2 w-2 rounded-full ${
          severity === "green" ? "bg-emerald-400" : severity === "yellow" ? "bg-amber-400" : "bg-rose-400"
        }`}
      />
      {label}
    </span>
  );
}

export default async function HealthPage() {
  const events = await readHealthEvents();
  const metrics = computeAgentHealthMetrics(events);

  const overallSeverity: "green" | "yellow" | "red" =
    metrics.totals.potentiallyStuckSessions > 0
      ? "red"
      : metrics.totals.stalledSessions > 0 || metrics.totals.failures24h > 0
        ? "yellow"
        : "green";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-10">
          <Link href="/" className="text-cyan-400 hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-white">Agent Health</h1>
              <p className="text-slate-400 mt-2">
                Live health view based on agent self-reports. Updated: <span className="text-slate-300">{new Date(metrics.generatedAt).toLocaleString()}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill
                severity={overallSeverity}
                label={
                  overallSeverity === "green"
                    ? "All clear"
                    : overallSeverity === "yellow"
                      ? "Attention needed"
                      : "Potentially stuck"
                }
              />
              <a
                href="/api/health/agents"
                className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800/40"
              >
                API
              </a>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            <div className="text-sm text-slate-400">Active sessions</div>
            <div className="mt-1 text-3xl font-bold text-white">{metrics.totals.activeSessions}</div>
            <div className="mt-2 text-xs text-slate-500">Heartbeat within 15 min</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            <div className="text-sm text-slate-400">Stalled runs</div>
            <div className="mt-1 text-3xl font-bold text-white">{metrics.totals.stalledSessions}</div>
            <div className="mt-2 text-xs text-slate-500">No events for &gt;10 min</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            <div className="text-sm text-slate-400">Potentially stuck</div>
            <div className="mt-1 text-3xl font-bold text-white">{metrics.totals.potentiallyStuckSessions}</div>
            <div className="mt-2 text-xs text-slate-500">No heartbeat for &gt;15 min</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5">
            <div className="text-sm text-slate-400">Success rate (24h)</div>
            <div className="mt-1 text-3xl font-bold text-white">{pct(metrics.successRate24h.rate)}</div>
            <div className="mt-2 text-xs text-slate-500">
              {metrics.successRate24h.success} ok / {metrics.successRate24h.total} total
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Active */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Active sessions</h2>
              <span className="text-xs text-slate-500">{metrics.activeSessions.length} shown</span>
            </div>

            {metrics.activeSessions.length === 0 ? (
              <p className="text-sm text-slate-400 mt-4">No active sessions reported.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {metrics.activeSessions.slice(0, 12).map((s) => (
                  <div key={s.sessionKey} className="flex items-start justify-between gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{s.agentId}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">{s.agentType}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        last heartbeat {fmtDuration(s.sinceLastMs)} ago • uptime {fmtDuration(s.uptimeMs)}
                      </div>
                      {s.runId ? <div className="text-xs text-slate-600 mt-1">runId: {s.runId}</div> : null}
                      {s.message ? <div className="text-xs text-slate-400 mt-2">{s.message}</div> : null}
                    </div>
                    <StatusPill severity="green" label="ok" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stalled/stuck + failures */}
          <div className="space-y-6">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Stalled / stuck</h2>
                <span className="text-xs text-slate-500">{metrics.stalledOrStuckSessions.length} detected</span>
              </div>

              {metrics.stalledOrStuckSessions.length === 0 ? (
                <p className="text-sm text-slate-400 mt-4">No stalled runs detected.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {metrics.stalledOrStuckSessions.slice(0, 10).map((s) => (
                    <div key={s.sessionKey} className="flex items-start justify-between gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{s.agentId}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">{s.agentType}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          last event {fmtDuration(s.sinceLastMs)} ago • first seen {new Date(s.firstSeenAt).toLocaleString()}
                        </div>
                        {s.runId ? <div className="text-xs text-slate-600 mt-1">runId: {s.runId}</div> : null}
                        {s.message ? <div className="text-xs text-slate-400 mt-2">{s.message}</div> : null}
                      </div>
                      <StatusPill severity={s.severity === "red" ? "red" : "yellow"} label={s.severity === "red" ? "stuck" : "stalled"} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Recent failures (24h)</h2>
                <span className="text-xs text-slate-500">{metrics.totals.failures24h} total</span>
              </div>

              {metrics.recentFailures.length === 0 ? (
                <p className="text-sm text-slate-400 mt-4">No failures in the last 24 hours.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {metrics.recentFailures.slice(0, 8).map((f) => (
                    <div key={`${f.ts}-${f.agentId}-${f.runId ?? ""}`} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{f.agentId}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">{f.agentType}</span>
                        </div>
                        <StatusPill severity="red" label="error" />
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(f.ts).toLocaleString()}</div>
                      {f.runId ? <div className="text-xs text-slate-600 mt-1">runId: {f.runId}</div> : null}
                      {f.message ? <div className="text-xs text-slate-300 mt-2">{f.message}</div> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Avg durations */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Average run duration by agent type (24h)</h2>
            <span className="text-xs text-slate-500">Based on completion events</span>
          </div>

          {metrics.averageRunDurationByAgentType.length === 0 ? (
            <p className="text-sm text-slate-400 mt-4">No completed runs reported in the last 24 hours.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {metrics.averageRunDurationByAgentType.slice(0, 12).map((row) => (
                <div key={row.agentType} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{row.agentType}</span>
                    <span className="text-xs text-slate-500">{row.runs} runs</span>
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-100">{fmtDuration(row.avgDurationMs)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-xs text-slate-500">
          <div>
            Alert rules (MVP): no events for &gt;10 min → <span className="text-amber-300">stalled</span>, no heartbeat for &gt;15 min → <span className="text-rose-300">potentially stuck</span>.
          </div>
          <div className="mt-2">
            Agents can post events to <a className="text-cyan-400 hover:underline" href="/api/health/report">/api/health/report</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
