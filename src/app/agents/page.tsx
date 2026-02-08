import { getAgents } from "@/lib/data";
import { listAgentProfiles } from "@/lib/server/agentProfiles";
import { getPublicAgentActivityBadges } from "@/lib/server/publicAgentActivity";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import { AgentsDirectoryClient, type AgentDirectoryCard } from "@/app/agents/AgentsDirectoryClient";

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

export default async function AgentsPage() {
  const agents = getAgents();
  const profiles = await listAgentProfiles();
  const profileByHandle = new Map(profiles.map((p) => [p.handle, p]));

  const activityBadges = await getPublicAgentActivityBadges(agents.map((a) => a.handle));

  const cards: AgentDirectoryCard[] = agents
    .slice()
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
    .map((a) => {
      const profile = profileByHandle.get(a.handle);
      const badge = activityBadges[(a.handle ?? "").toLowerCase()];

      return {
        id: a.id,
        handle: a.handle,
        name: a.name,
        domain: a.domain,
        avatar: a.avatar,
        role: a.role,
        featured: a.featured,
        platforms: a.platforms,
        verifiedAgentJson: !!a.links?.agentJson,
        installedSkillCount: profile?.installedSkills?.length ?? 0,
        activityCount7d: badge?.count7d ?? 0,
      };
    });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">🤖 Agent Directory</h1>
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
          <p className="mt-6 font-mono text-sm text-muted-foreground">{agents.length} registered agents</p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Directory */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <AgentsDirectoryClient agents={cards} />
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
            <Link href="/skills/agent-identity-kit">📄 Learn about agent.json</Link>
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
