"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ConnectorType = "oauth" | "api-key" | "webhook" | "mcp";
type ConnectorStatus = "active" | "beta" | "deprecated";

interface Connector {
  name: string;
  slug: string;
  type: ConnectorType;
  status: ConnectorStatus;
  description: string;
  authMethod: string;
  configFields: string[];
  installCount: number;
}

interface ConnectorResponse {
  connectors: Connector[];
  total: number;
  types: ConnectorType[];
  statuses: ConnectorStatus[];
}

const TYPE_LABELS: Record<ConnectorType, string> = {
  oauth: "OAuth",
  "api-key": "API Key",
  webhook: "Webhook",
  mcp: "MCP",
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [types, setTypes] = useState<ConnectorType[]>([]);
  const [statuses, setStatuses] = useState<ConnectorStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | ConnectorType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ConnectorStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();

    async function loadConnectors() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (typeFilter !== "all") params.set("type", typeFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());

        const response = await fetch(`/api/connectors?${params.toString()}`, {
          method: "GET",
          signal: abort.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load connectors");
        }

        const data = (await response.json()) as ConnectorResponse;
        setConnectors(data.connectors ?? []);
        setTypes(data.types ?? []);
        setStatuses(data.statuses ?? []);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Could not load connectors. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadConnectors();

    return () => {
      abort.abort();
    };
  }, [typeFilter, statusFilter, search]);

  const featuredCount = useMemo(() => connectors.filter((connector) => connector.status === "active").length, [connectors]);

  const getTypeBadgeColor = (type: ConnectorType) => {
    switch (type) {
      case "oauth":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "api-key":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "webhook":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "mcp":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    }
  };

  const getStatusBadgeColor = (status: ConnectorStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "beta":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "deprecated":
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  async function trackInstall(slug: string) {
    try {
      const response = await fetch("/api/connectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "install", slug }),
      });

      if (!response.ok) return;

      const data = (await response.json()) as { connector?: Connector };
      if (!data.connector) return;

      setConnectors((previous) =>
        previous.map((connector) =>
          connector.slug === slug ? { ...connector, installCount: data.connector!.installCount } : connector
        )
      );
    } catch {
      // no-op; install tracking is best-effort
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[380px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-purple/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#06D6A0]/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Connector Directory
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            Real connector data backed by persistent storage and API routes
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {connectors.length} shown • {featuredCount} active connectors
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link
              href="/connectors/oauth-guide"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              OAuth Guide for Agents →
            </Link>
            <Link
              href="/connectors/vault"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 font-semibold text-sm hover:bg-purple-500/20 transition-all"
            >
              Token Vault (Coming Soon)
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <label htmlFor="connector-search" className="text-sm font-semibold text-muted-foreground mb-2 block">
            Search connectors
          </label>
          <input
            id="connector-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, auth method, config field..."
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/40"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Filter by type</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === "all"
                  ? "bg-[#06D6A0] text-[#0a0a0a]"
                  : "border border-white/10 text-foreground hover:bg-white/5"
              }`}
            >
              All
            </button>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === type
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Filter by status</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "border border-white/10 text-foreground hover:bg-white/5"
              }`}
            >
              All statuses
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "border border-white/10 text-foreground hover:bg-white/5"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <p className="text-muted-foreground">Loading connectors...</p>
        ) : error ? (
          <p className="text-red-300">{error}</p>
        ) : connectors.length === 0 ? (
          <p className="text-muted-foreground">No connectors found for your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectors.map((connector) => (
              <Card
                key={connector.slug}
                className="relative overflow-hidden bg-card/30 border-white/10 hover:border-purple-500/30 transition-all group h-full"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{connector.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getTypeBadgeColor(connector.type)}>
                      {TYPE_LABELS[connector.type]}
                    </Badge>
                    <Badge variant="outline" className={getStatusBadgeColor(connector.status)}>
                      {connector.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{connector.description}</p>
                  <p className="text-xs text-muted-foreground">Auth: {connector.authMethod}</p>
                  <p className="text-xs text-muted-foreground">
                    Config fields: {connector.configFields.length} • Installs: {connector.installCount.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => trackInstall(connector.slug)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#06D6A0]/40 text-[#06D6A0] text-xs font-semibold hover:bg-[#06D6A0]/10 transition-colors"
                    >
                      Track install +1
                    </button>
                    <Link
                      href={`/connectors/${connector.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
