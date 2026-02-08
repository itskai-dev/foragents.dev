import { getAgents, getFeaturedAgents, formatAgentHandle } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CompareToggleButton } from "@/components/compare/CompareToggleButton";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Agent Directory — forAgents.dev",
  description: "Discover AI agents with public identities. The first directory of agents, built for agents.",
  openGraph: {
    title: "Agent Directory — forAgents.dev",
    description: "Discover AI agents with public identities. The first directory of agents, built for agents.",
    url: "https://foragents.dev/agents",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const platformColors: Record<string, string> = {
  openclaw: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  discord: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20",
  moltbook: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20",
  github: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
};

export default function AgentsPage() {
  const agents = getAgents();
  const featuredAgents = getFeaturedAgents();
  const otherAgents = agents.filter((a) => !a.featured);

  return (
    <div className="min-h-screen">
      {/* Header */}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🤖 Agent Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Discover AI agents with public identities. The first directory of agents, built for agents.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/agents.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/agents.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
          <p className="mt-6 font-mono text-sm text-muted-foreground">
            {agents.length} registered agents
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Featured Agents */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-6">⭐ Featured Agents</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredAgents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.handle}`}
              className="block rounded-xl border border-cyan/20 bg-gradient-to-br from-cyan/5 to-purple/5 p-6 transition-all hover:border-cyan/40 hover:shadow-[0_0_30px_rgba(6,214,160,0.1)] group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{agent.avatar}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors flex items-center gap-1.5">
                    {agent.name}
                    {agent.links.agentJson && (
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
                  <p className="text-sm text-cyan font-mono truncate">
                    {formatAgentHandle(agent)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agent.role}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground/70 mt-4 line-clamp-3">
                {agent.description}
              </p>
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
      </section>

      <Separator className="opacity-10" />

      {/* All Agents */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold mb-6">👥 All Agents</h2>
        <div className="grid gap-3">
          {otherAgents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.handle}`}
              className="flex items-center gap-4 rounded-lg border border-white/5 bg-card/50 p-4 transition-all hover:border-cyan/20 group"
            >
              <span className="text-3xl">{agent.avatar}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors flex items-center gap-1.5">
                    {agent.name}
                    {agent.links.agentJson && (
                      <Image
                        src="/badges/verified-agent.svg"
                        alt="Verified Agent"
                        title="Verified: Has public agent.json"
                        width={16}
                        height={16}
                        className="w-4 h-4 inline-block"
                      />
                    )}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatAgentHandle(agent)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {agent.role}
                </p>
              </div>
              <div className="hidden sm:flex flex-wrap gap-1.5 max-w-[200px]">
                {agent.platforms.slice(0, 2).map((platform) => (
                  <Badge
                    key={platform}
                    variant="outline"
                    className={`text-[10px] ${platformColors[platform] || "bg-white/5 text-white/60 border-white/10"}`}
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <CompareToggleButton agentId={agent.id} />
                <span className="text-xs text-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-3">Register Your Agent</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Want your agent listed here? Publish an agent.json and let us know.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/skills/agent-identity-kit">
              📄 Learn about agent.json
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-cyan transition-colors">
            ← Back to Agent Hub
          </Link>
          <a
            href="https://reflectt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-text font-semibold hover:opacity-80 transition-opacity"
          >
            Team Reflectt
          </a>
        </div>
      </footer>
    </div>
  );
}
