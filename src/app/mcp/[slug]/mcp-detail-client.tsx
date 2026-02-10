"use client";

import * as React from "react";
import type { McpServer } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

type InstallInstruction = {
  id: "claude" | "cursor" | "vscode" | "openclaw" | "generic";
  label: string;
  filePath: string;
  snippetLabel: string;
  snippet: string;
  note: string;
  copyText: string;
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

function parseInstallCommand(server: McpServer): { command: string; args: string[] } {
  const tokens = tokenizeCommand(server.install_cmd);
  return {
    command: tokens[0] ?? "npx",
    args: tokens.slice(1),
  };
}

function buildMcpServerEntry(server: McpServer): { command: string; args: string[] } {
  return parseInstallCommand(server);
}

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildInstallInstructions(server: McpServer): InstallInstruction[] {
  const entry = buildMcpServerEntry(server);

  const mcpServerConfig = {
    mcpServers: {
      [server.slug]: entry,
    },
  };

  return [
    {
      id: "claude",
      label: "Claude Desktop",
      filePath: "~/Library/Application Support/Claude/claude_desktop_config.json",
      snippetLabel: "JSON snippet",
      snippet: formatJson(mcpServerConfig),
      note: "Add this under mcpServers and restart Claude Desktop.",
      copyText: formatJson(mcpServerConfig),
    },
    {
      id: "cursor",
      label: "Cursor",
      filePath: ".cursor/mcp.json",
      snippetLabel: "JSON snippet",
      snippet: formatJson(mcpServerConfig),
      note: "Create this file if missing, then reload Cursor.",
      copyText: formatJson(mcpServerConfig),
    },
    {
      id: "vscode",
      label: "VS Code (Copilot)",
      filePath: ".vscode/mcp.json",
      snippetLabel: "JSON snippet",
      snippet: formatJson(mcpServerConfig),
      note: "Save, then run “Developer: Reload Window” in VS Code.",
      copyText: formatJson(mcpServerConfig),
    },
    {
      id: "openclaw",
      label: "OpenClaw",
      filePath: "~/.openclaw/openclaw.json",
      snippetLabel: "skills entry snippet",
      snippet: formatJson({
        skills: {
          entries: {
            [server.slug]: {
              enabled: true,
              config: {
                command: entry.command,
                args: entry.args,
              },
            },
          },
        },
      }),
      note: "Merge under skills.entries, then restart the OpenClaw gateway.",
      copyText: formatJson({
        skills: {
          entries: {
            [server.slug]: {
              enabled: true,
              config: {
                command: entry.command,
                args: entry.args,
              },
            },
          },
        },
      }),
    },
    {
      id: "generic",
      label: "Generic (npx)",
      filePath: "Terminal / shell",
      snippetLabel: "Command",
      snippet: server.install_cmd,
      note: "Run this command directly to start the MCP server over stdio.",
      copyText: server.install_cmd,
    },
  ];
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
  const [activeInstallTab, setActiveInstallTab] = React.useState<InstallInstruction["id"]>("claude");

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
  const installInstructions = React.useMemo(() => buildInstallInstructions(activeServer), [activeServer]);
  const activeInstruction = React.useMemo(
    () => installInstructions.find((instruction) => instruction.id === activeInstallTab) ?? installInstructions[0],
    [activeInstallTab, installInstructions]
  );

  React.useEffect(() => {
    setAdded(false);
  }, [activeInstallTab]);

  const onAddToConfig = React.useCallback(async () => {
    if (adding || !activeInstruction) return;
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
        await navigator.clipboard.writeText(activeInstruction.copyText);
      }

      setAdded(true);
    } catch {
      // No-op: keep UI stable if tracking or clipboard fails.
    } finally {
      setAdding(false);
    }
  }, [activeInstruction, activeServer, adding, health, slug]);

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
            {adding ? "Copying…" : added ? "Copied" : "Copy Install Snippet"}
          </Button>
        </div>

        <Tabs value={activeInstallTab} onValueChange={(value) => setActiveInstallTab(value as InstallInstruction["id"])}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-white/5 p-1">
            {installInstructions.map((instruction) => (
              <TabsTrigger key={instruction.id} value={instruction.id} className="text-xs sm:text-sm">
                {instruction.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {installInstructions.map((instruction) => (
            <TabsContent key={instruction.id} value={instruction.id} className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-mono text-muted-foreground">Config path</p>
                <code className="text-xs text-cyan break-all">{instruction.filePath}</code>
              </div>

              <div>
                <p className="mb-2 text-xs font-mono text-muted-foreground">{instruction.snippetLabel}</p>
                <div className="relative">
                  <pre className="rounded-lg border border-white/10 bg-black/40 p-3 pr-12 overflow-x-auto">
                    <code className="text-xs text-green whitespace-pre-wrap">{instruction.snippet}</code>
                  </pre>
                  <CopyButton
                    text={instruction.copyText}
                    label={`${instruction.label} snippet`}
                    size="icon"
                    variant="ghost"
                    className="absolute top-1.5 right-1.5 h-8 w-8 text-white/70 hover:text-white"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{instruction.note}</p>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
