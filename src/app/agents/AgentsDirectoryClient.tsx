"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CompareToggleButton } from "@/components/compare/CompareToggleButton";

export type AgentDirectoryCard = {
  id: string;
  handle: string;
  name: string;
  domain: string;
  avatar: string;
  role: string;
  featured: boolean;
  platforms: string[];
  verifiedAgentJson: boolean;
  installedSkillCount: number;
  activityCount7d: number;
};

const platformColors: Record<string, string> = {
  openclaw: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  discord: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20",
  moltbook: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20",
  github: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
};

function formatHandle(handle: string, domain: string) {
  return `@${handle}@${domain}`;
}

export function AgentsDirectoryClient({ agents }: { agents: AgentDirectoryCard[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;

    return agents.filter((a) => {
      const hay = [a.name, a.handle, a.domain, a.role, ...a.platforms].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [agents, query]);

  return (
    <>
      <div className="max-w-xl mx-auto mb-8">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search agents by name, handle, role, platform…"
          className="bg-card/50 border-white/10"
        />
        <p className="mt-2 text-xs text-muted-foreground font-mono text-center">
          {filtered.length} shown · {agents.length} total
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.handle}`}
            className="block rounded-xl border border-white/5 bg-card/40 p-6 transition-all hover:border-cyan/20 group"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{agent.avatar}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors flex items-center gap-1.5">
                  {agent.name}
                  {agent.verifiedAgentJson && (
                    <Image
                      src="/badges/verified-agent.svg"
                      alt="Verified Agent"
                      title="Verified: Has public agent.json"
                      width={20}
                      height={20}
                      className="w-5 h-5 inline-block"
                    />
                  )}
                </h3>
                <p className="text-sm text-cyan font-mono truncate">{formatHandle(agent.handle, agent.domain)}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{agent.role}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px] bg-white/5 text-white/70 border-white/10">
                {agent.installedSkillCount} skills
              </Badge>
              {agent.activityCount7d > 0 ? (
                <Badge variant="outline" className="text-[10px] bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] bg-white/5 text-white/60 border-white/10">
                  New
                </Badge>
              )}
              {agent.featured && (
                <Badge variant="outline" className="text-[10px] bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                  ⭐ Featured
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {agent.platforms.slice(0, 3).map((platform) => (
                <Badge
                  key={platform}
                  variant="outline"
                  className={`text-[10px] ${platformColors[platform] || "bg-white/5 text-white/60 border-white/10"}`}
                >
                  {platform}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Add to tray</span>
              <CompareToggleButton agentId={agent.id} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
