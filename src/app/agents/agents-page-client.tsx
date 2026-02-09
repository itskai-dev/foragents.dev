"use client";

import { useState, useMemo } from "react";
import { type Agent } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface AgentsPageClientProps {
  agents: Agent[];
}

export function AgentsPageClient({ agents }: AgentsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Get unique platforms
  const allPlatforms = useMemo(() => {
    const platformSet = new Set<string>();
    agents.forEach((agent) => {
      agent.platforms.forEach((p) => platformSet.add(p));
    });
    return Array.from(platformSet).sort();
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          agent.name.toLowerCase().includes(query) ||
          agent.description.toLowerCase().includes(query) ||
          agent.role.toLowerCase().includes(query) ||
          agent.handle.toLowerCase().includes(query) ||
          agent.skills.some((skill) => skill.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Platform filter
      if (platformFilter && !agent.platforms.includes(platformFilter)) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !agent.verified) {
        return false;
      }

      return true;
    });
  }, [agents, searchQuery, platformFilter, verifiedOnly]);

  const featuredAgents = filteredAgents.filter((a) => a.featured);
  const otherAgents = filteredAgents.filter((a) => !a.featured);

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <Input
          type="search"
          placeholder="Search agents by name, role, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-2xl bg-black/40 border-white/10 text-white placeholder:text-white/40"
        />

        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-muted-foreground">Filter by:</span>

          {/* Verified toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              verifiedOnly
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            }`}
          >
            ✓ Verified Only
          </button>

          {/* Platform filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPlatformFilter(null)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                platformFilter === null
                  ? "bg-cyan/20 text-cyan border border-cyan/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              All Platforms
            </button>
            {allPlatforms.slice(0, 6).map((platform) => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform === platformFilter ? null : platform)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  platformFilter === platform
                    ? "bg-cyan/20 text-cyan border border-cyan/30"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredAgents.length} of {agents.length} agents
        </p>
      </div>

      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4 flex items-center gap-2">
            <span>⭐</span>
            <span>Featured Agents</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* All Other Agents */}
      {otherAgents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] mb-4">
            {featuredAgents.length > 0 ? "More Agents" : "All Agents"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-2">No agents found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agents/${agent.handle}`}>
      <Card className="bg-black/20 border-white/10 hover:border-cyan/30 transition-all cursor-pointer h-full group">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-4xl">{agent.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                  {agent.name}
                </h3>
                {agent.verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
            {agent.description}
          </p>

          {/* Trust Score */}
          {agent.trustScore !== undefined && (
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xs text-muted-foreground">Trust Score:</div>
              <div
                className={`text-sm font-bold ${
                  agent.trustScore >= 95
                    ? "text-emerald-400"
                    : agent.trustScore >= 85
                    ? "text-cyan-400"
                    : "text-amber-400"
                }`}
              >
                {agent.trustScore}
              </div>
            </div>
          )}

          {/* Platforms */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.platforms.slice(0, 3).map((platform) => (
              <Badge
                key={platform}
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                {platform}
              </Badge>
            ))}
            {agent.platforms.length > 3 && (
              <Badge
                variant="outline"
                className="bg-white/5 text-white/60 border-white/10 text-[10px] px-2 py-0"
              >
                +{agent.platforms.length - 3}
              </Badge>
            )}
          </div>

          {/* Skills preview */}
          {agent.skills.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {agent.skills.slice(0, 3).join(", ")}
              {agent.skills.length > 3 && ` +${agent.skills.length - 3} more`}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
