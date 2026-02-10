/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type EcosystemCategoryId = "skills" | "agents" | "protocols" | "tools" | "community";

type EcosystemCategory = {
  id: EcosystemCategoryId;
  name: string;
  count: number;
  description: string;
  growth: number;
  topItems: string[];
};

type EcosystemResponse = {
  generatedAt: string;
  totals: {
    ecosystemNodes: number;
    skillCount: number;
    skillCategoryCount: number;
    mcpServerCount: number;
    agentCount: number;
    integrationCount: number;
    threadCount: number;
    eventCount: number;
    bountyCount: number;
  };
  communityStats: {
    threads: number;
    events: number;
    bounties: number;
    openBounties: number;
  };
  categories: EcosystemCategory[];
  connections: Array<{
    from: EcosystemCategoryId;
    to: EcosystemCategoryId;
    description: string;
  }>;
  usedFallback: boolean;
};

const categoryAccent: Record<EcosystemCategoryId, string> = {
  skills: "#06D6A0",
  agents: "#8B5CF6",
  protocols: "#3B82F6",
  tools: "#F59E0B",
  community: "#EC4899",
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EcosystemPage() {
  const [data, setData] = useState<EcosystemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/ecosystem", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load ecosystem data");
        }

        const payload = (await response.json()) as EcosystemResponse;

        if (!cancelled) {
          setData(payload);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load ecosystem overview right now. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalGrowth = useMemo(() => {
    if (!data) return 0;
    if (data.categories.length === 0) return 0;

    const sum = data.categories.reduce((acc, category) => acc + category.growth, 0);
    return Math.round(sum / data.categories.length);
  }, [data]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[#06D6A0]/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 w-full">
          <h1 className="text-[38px] md:text-[52px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-3">
            Ecosystem Map
          </h1>
          <p className="text-lg text-foreground/80 mb-8">
            Real-time snapshot of skills, agents, protocols, tools, and community momentum.
          </p>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading ecosystem metrics…</div>
          ) : error ? (
            <div className="text-sm text-red-300">{error}</div>
          ) : data ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-card/30 border-white/10">
                <CardContent className="pt-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Nodes</div>
                  <div className="text-3xl font-bold text-[#06D6A0]">{data.totals.ecosystemNodes}</div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardContent className="pt-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Skills</div>
                  <div className="text-3xl font-bold text-[#8B5CF6]">{data.totals.skillCount}</div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardContent className="pt-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Agents</div>
                  <div className="text-3xl font-bold text-[#3B82F6]">{data.totals.agentCount}</div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardContent className="pt-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">MCP Servers</div>
                  <div className="text-3xl font-bold text-[#F59E0B]">{data.totals.mcpServerCount}</div>
                </CardContent>
              </Card>

              <Card className="bg-card/30 border-white/10">
                <CardContent className="pt-5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Growth</div>
                  <div className="text-3xl font-bold text-[#EC4899]">+{totalGrowth}%</div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <Card className="bg-card/20 border-white/10">
            <CardContent className="pt-6 text-sm text-muted-foreground">Loading category overview…</CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-card/20 border-red-400/30">
            <CardContent className="pt-6 text-sm text-red-300">{error}</CardContent>
          </Card>
        ) : data ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.categories.map((category) => (
                <Card key={category.id} className="bg-card/30 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: categoryAccent[category.id],
                          color: categoryAccent[category.id],
                          backgroundColor: `${categoryAccent[category.id]}20`,
                        }}
                      >
                        +{category.growth}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4" style={{ color: categoryAccent[category.id] }}>
                      {category.count}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Top items</div>
                    <ul className="space-y-1.5 text-sm">
                      {category.topItems.map((item) => (
                        <li key={item} className="text-foreground/85">• {item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Connection map</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Text-based relationship view across ecosystem layers.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 font-mono text-sm">
                {data.connections.map((connection, index) => (
                  <div key={`${connection.from}-${connection.to}-${index}`} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                    <div className="text-white">
                      {connection.from} ──▶ {connection.to}
                    </div>
                    <div className="text-muted-foreground">{connection.description}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/30 border-white/10">
              <CardHeader>
                <CardTitle className="text-2xl">Community activity snapshot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Threads</div>
                    <div className="text-2xl font-semibold">{data.communityStats.threads}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Events</div>
                    <div className="text-2xl font-semibold">{data.communityStats.events}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Bounties</div>
                    <div className="text-2xl font-semibold">{data.communityStats.bounties}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Open bounties</div>
                    <div className="text-2xl font-semibold">{data.communityStats.openBounties}</div>
                  </div>
                </div>
                <div className="mt-6 text-xs text-muted-foreground">
                  Last refreshed: {formatDate(data.generatedAt)}
                  {data.usedFallback ? " • showing seed fallback data" : ""}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </div>
  );
}
