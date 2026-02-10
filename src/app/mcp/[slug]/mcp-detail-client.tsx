"use client";

import * as React from "react";
import type { McpServer } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";

type HealthStatus = "operational" | "degraded" | "outage" | "unknown";

type McpDetailResponse = {
  server: McpServer;
  installs: number;
  health: {
    status: HealthStatus;
    lastCheck: string | null;
    uptime: number | null;
  };
};

const UNKNOWN_HEALTH: McpDetailResponse["health"] = {
  status: "unknown",
  lastCheck: null,
  uptime: null,
};

function tokenizeCommand(command: string): string[] {
  const matches = command.match(/(?:[^\s\"]+|\"[^\"]*\")+/g) ?? [];
  return matches.map((token) => token.replace(/^"|"$/g, ""));
}

function buildConfigSnippet(server: McpServer): string {
  const tokens = tokenizeCommand(server.install_cmd);
  const command = tokens[0] ?? "npx";
  const args = tokens.slice(1);

  const config = {
    mcpServers: {
      [server.slug]: {
        command,
        args,
      },
    },
  };

  return JSON.stringify(config, null, 2);
}

function healthClass(status: HealthStatus): string {
  if (status === "operational") return "bg-emerald-400";
  if (status === "degraded") return "bg-amber-400";
  if (status === "outage") return "bg-rose-400";
  return "bg-slate-400";
}

export function McpDetailClient({ slug, initialServer }: { slug: string; initialServer: McpServer }) {
  const [payload, setPayload] = React.useState<McpDetailResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/api/mcp/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;

        const json = (await response.json()) as McpDetailResponse;
        setPayload(json);
      } finally {
        setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [slug]);

  const activeServer = payload?.server ?? initialServer;
  const installs = payload?.installs ?? 0;
  const health = payload?.health;
  const configSnippet = React.useMemo(() => buildConfigSnippet(activeServer), [activeServer]);

  const onAddToConfig = React.useCallback(async () => {
    if (adding) return;
    setAdding(true);

    try {
      const response = await fetch(`/api/mcp/${encodeURIComponent(slug)}/install`, { method: "POST" });
      const json = (await response.json()) as { installs?: number };

      const installCount = json.installs;

      if (typeof installCount === "number") {
        setPayload((prev) => ({
          server: prev?.server ?? activeServer,
          health: prev?.health ?? health ?? UNKNOWN_HEALTH,
          installs: installCount,
        }));
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(configSnippet);
      }

      setAdded(true);
    } catch {
      // No-op: keep UI stable if tracking or clipboard fails.
    } finally {
      setAdding(false);
    }
  }, [activeServer, adding, configSnippet, health, slug]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-white/10 bg-black/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-muted-foreground">Live status</p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${healthClass(health?.status ?? "unknown")}`} aria-hidden="true" />
              <span className="text-sm capitalize text-foreground">{health?.status ?? "unknown"}</span>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Last check: {health?.lastCheck ? new Date(health.lastCheck).toLocaleString() : "n/a"}</p>
            <p>Uptime: {typeof health?.uptime === "number" ? `${health.uptime}%` : "n/a"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan/15 text-cyan border border-cyan/30">
              {installs.toLocaleString()} {installs === 1 ? "install" : "installs"}
            </Badge>
            {loading && <span className="text-xs text-muted-foreground">Syncing…</span>}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onAddToConfig}
            disabled={adding}
            className={added ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30" : "bg-cyan text-background hover:bg-cyan/90"}
          >
            {adding ? "Adding…" : added ? "Added to Config" : "Add to Config"}
          </Button>
        </div>

        <div>
          <p className="mb-2 text-xs font-mono text-muted-foreground">Connection string</p>
          <div className="relative">
            <pre className="rounded-lg border border-white/10 bg-black/40 p-3 pr-12 overflow-x-auto">
              <code className="text-xs text-green whitespace-pre-wrap">{activeServer.install_cmd}</code>
            </pre>
            <CopyButton
              text={activeServer.install_cmd}
              label="Connection string"
              size="icon"
              variant="ghost"
              className="absolute top-1.5 right-1.5 h-8 w-8 text-white/70 hover:text-white"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-mono text-muted-foreground">Config snippet</p>
          <div className="relative">
            <pre className="rounded-lg border border-white/10 bg-black/40 p-3 pr-12 overflow-x-auto">
              <code className="text-xs text-green whitespace-pre-wrap">{configSnippet}</code>
            </pre>
            <CopyButton
              text={configSnippet}
              label="Config snippet"
              size="icon"
              variant="ghost"
              className="absolute top-1.5 right-1.5 h-8 w-8 text-white/70 hover:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
