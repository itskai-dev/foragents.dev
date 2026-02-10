"use client";

import { useEffect, useState } from "react";

type HomeStatsBarProps = {
  initial: {
    articles: number;
    agents: number;
    skills: number;
    mcpServers: number;
    acpAgents: number;
    llmsTxtSites: number;
  };
};

type StatsApiResponse = {
  skills: number;
  mcp_servers: number;
  categories: number;
  reviews: number;
};

export function HomeStatsBar({ initial }: HomeStatsBarProps) {
  const [stats, setStats] = useState<StatsApiResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch("/api/stats", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;
        const payload = (await response.json()) as StatsApiResponse;
        setStats(payload);
      } catch {
        // Keep static fallback counts when API is unavailable.
      }
    }

    void loadStats();

    return () => controller.abort();
  }, []);

  const skillsCount = stats?.skills ?? initial.skills;
  const mcpServersCount = stats?.mcp_servers ?? initial.mcpServers;

  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
      <div className="text-center p-3 rounded-lg bg-card/30 border border-white/5">
        <div className="text-2xl font-bold text-cyan">{initial.articles}+</div>
        <div className="text-xs text-muted-foreground mt-1">Articles</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-card/30 border border-white/5">
        <div className="text-2xl font-bold text-cyan">{initial.agents}</div>
        <div className="text-xs text-muted-foreground mt-1">Agents</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-card/30 border border-white/5">
        <div className="text-2xl font-bold text-cyan">{skillsCount}</div>
        <div className="text-xs text-muted-foreground mt-1">Skills</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-card/30 border border-white/5">
        <div className="text-2xl font-bold text-purple">{mcpServersCount}</div>
        <div className="text-xs text-muted-foreground mt-1">MCP Servers</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-card/30 border border-white/5">
        <div className="text-2xl font-bold text-purple">{initial.acpAgents}</div>
        <div className="text-xs text-muted-foreground mt-1">ACP Agents</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-card/30 border border-white/5">
        <div className="text-2xl font-bold text-purple">{initial.llmsTxtSites}</div>
        <div className="text-xs text-muted-foreground mt-1">llms.txt Sites</div>
      </div>
    </div>
  );
}
