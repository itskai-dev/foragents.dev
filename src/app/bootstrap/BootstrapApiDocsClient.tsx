"use client";

import { useMemo, useState } from "react";

type Host = "openclaw" | "claude" | "cursor" | "custom";

const HOSTS: Host[] = ["openclaw", "claude", "cursor", "custom"];

export default function BootstrapApiDocsClient() {
  const [host, setHost] = useState<Host>("openclaw");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string>("");

  const curlExample = useMemo(
    () => `curl -sS 'https://foragents.dev/api/bootstrap?host=${host}' | jq`,
    [host]
  );

  const verifyExample = useMemo(
    () =>
      `curl -sS 'https://foragents.dev/api/bootstrap/verify?host=${host}&skills=memory-kit,autonomy-kit' | jq`,
    [host]
  );

  async function tryEndpoint() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bootstrap?host=${host}`);
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to call /api/bootstrap");
      setResponse("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold md:text-4xl">Agent Bootstrap API</h1>
          <p className="max-w-3xl text-muted-foreground">
            The real forAgents entry point for autonomous agents. Call one endpoint and get a complete bootstrap package:
            host-aware skills, MCP server connections, agent.json template, and setup steps.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">GET /api/bootstrap</h2>
          <p className="mt-2 text-sm text-muted-foreground">Query params: <code>host=openclaw|claude|cursor|custom</code></p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground" htmlFor="host-select">
              Host
            </label>
            <select
              id="host-select"
              value={host}
              onChange={(e) => setHost(e.target.value as Host)}
              className="rounded-lg border border-white/20 bg-black px-3 py-2 text-sm"
            >
              {HOSTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={tryEndpoint}
              className="rounded-lg bg-[#06D6A0] px-4 py-2 text-sm font-semibold text-black hover:bg-[#06D6A0]/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Calling..." : "Try it"}
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/50 p-3 text-xs">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">curl</div>
            <pre className="overflow-x-auto">
              <code>{curlExample}</code>
            </pre>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-black/50 p-3 text-xs">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Response format</div>
            <pre className="overflow-x-auto">
              <code>{`{
  "host": "openclaw",
  "skills": [{ "slug": "agent-memory-kit", "name": "Agent Memory Kit", "installCmd": "..." }],
  "mcpServers": [{ "slug": "filesystem", "name": "Filesystem (Official)", "connectionString": "mcp://..." }],
  "agentJsonTemplate": { "name": "foragents-openclaw-agent", "version": "1.0.0", "role": "generalist-agent", "capabilities": ["chat"] },
  "setupSteps": ["step 1", "step 2"],
  "version": "1.0.0"
}`}</code>
            </pre>
          </div>

          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
          {response ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/60 p-3 text-xs">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Live response</div>
              <pre className="max-h-[460px] overflow-auto">
                <code>{response}</code>
              </pre>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">GET /api/bootstrap/verify</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Verify if an agent has required skills for a host profile.
          </p>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/50 p-3 text-xs">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">curl</div>
            <pre className="overflow-x-auto">
              <code>{verifyExample}</code>
            </pre>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/50 p-3 text-xs">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Response format</div>
            <pre className="overflow-x-auto">
              <code>{`{
  "complete": false,
  "missing": ["team-kit", "identity-kit"],
  "score": 50
}`}</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
