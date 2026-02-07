import { notFound } from "next/navigation";
import { getAgents, getAgentByHandle, formatAgentHandle } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VerifiedBadge } from "@/components/PremiumBadge";
import { SaveToCollectionButton } from "@/components/collections/SaveToCollectionButton";
import Link from "next/link";
import { TrackRecentlyViewed } from "@/components/recently-viewed/TrackRecentlyViewed";

// Generate static paths for all agents
export function generateStaticParams() {
  return getAgents().map((agent) => ({ handle: agent.handle }));
}

export function generateMetadata({ params }: { params: { handle: string } }) {
  const agent = getAgentByHandle(params.handle);
  if (!agent) return { title: "Agent Not Found" };

  const baseUrl = "https://foragents.dev";
  const handle = formatAgentHandle(agent);
  const url = `${baseUrl}/agents/${agent.handle}`;
  const title = `${agent.name} (${handle}) — forAgents.dev`;
  const description = agent.description;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "forAgents.dev",
      type: "profile",
      images: [
        {
          url: "/api/og",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/api/og"],
    },
  };
}

const platformColors: Record<string, string> = {
  openclaw: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  discord: "bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20",
  moltbook: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20",
  github: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
};

const skillColors: Record<string, string> = {
  orchestration: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20",
  coding: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  strategy: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  communication: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
  research: "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20",
  design: "bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20",
  monitoring: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  "web-development": "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20",
  "api-design": "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20",
};

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const agent = getAgentByHandle(handle);
  if (!agent) notFound();

  const allAgents = getAgents().filter((a) => a.handle !== handle);
  const relatedAgents = allAgents.slice(0, 4);
  const formattedHandle = formatAgentHandle(agent);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: agent.name,
    description: agent.description,
    url: `https://foragents.dev/agents/${agent.handle}`,
    applicationCategory: "AI Agent",
    author: {
      "@type": "Organization",
      name: "forAgents.dev",
      url: "https://foragents.dev",
    },
  };

  return (
    <div className="min-h-screen">
      <TrackRecentlyViewed item={{ type: "agent", key: agent.handle, title: agent.name, href: `/agents/${agent.handle}` }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-lg font-bold aurora-text hover:opacity-80 transition-opacity">
              ⚡ Agent Hub
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Agents
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">{agent.name}</span>
          </div>
          <Link
            href={`/api/agents/${agent.handle}.json`}
            className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
          >
            .json
          </Link>
        </div>
      </header>

      {/* Agent Profile */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <div className="relative rounded-2xl border border-cyan/20 bg-gradient-to-br from-cyan/5 to-purple/5 p-8 mb-8">
          {/* Featured badge */}
          {agent.featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                ⭐ Featured
              </Badge>
            </div>
          )}

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="text-6xl">{agent.avatar}</div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#F8FAFC] mb-1 flex items-center gap-2">
                {agent.name}
                {agent.links?.agentJson && (
                  <VerifiedBadge className="w-5 h-5 text-xs" />
                )}
              </h1>
              <p className="text-cyan font-mono text-lg mb-2">
                {formattedHandle}
              </p>
              <p className="text-muted-foreground">
                {agent.role}
              </p>

              <div className="mt-4">
                <SaveToCollectionButton itemType="agent" agentHandle={formattedHandle} label="Save to collection" />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground/80 leading-relaxed mt-6 text-[15px]">
            {agent.description}
          </p>
        </div>

        {/* Platforms */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">📡 Platforms</h2>
          <div className="flex flex-wrap gap-2">
            {agent.platforms.map((platform) => (
              <Badge
                key={platform}
                variant="outline"
                className={`text-sm px-3 py-1 ${platformColors[platform] || "bg-white/5 text-white/60 border-white/10"}`}
              >
                {platform}
              </Badge>
            ))}
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Skills */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">🛠️ Skills & Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {agent.skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className={`text-sm px-3 py-1 ${skillColors[skill] || "bg-white/5 text-white/60 border-white/10"}`}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Links */}
        {Object.keys(agent.links).length > 0 && (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">🔗 Links</h2>
              <div className="flex flex-col gap-3">
                {agent.links.agentJson && (
                  <a
                    href={agent.links.agentJson}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    📄 agent.json ↗
                  </a>
                )}
                {agent.links.twitter && (
                  <a
                    href={agent.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    🐦 Twitter ↗
                  </a>
                )}
                {agent.links.github && (
                  <a
                    href={agent.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    📦 GitHub ↗
                  </a>
                )}
                {agent.links.website && (
                  <a
                    href={agent.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan hover:underline"
                  >
                    🌐 Website ↗
                  </a>
                )}
              </div>
            </section>
            <Separator className="opacity-10 my-8" />
          </>
        )}

        {/* API Access */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">🔌 API Access</h2>
          <div className="flex flex-col gap-2">
            <Link
              href={`/api/agents/${agent.handle}.json`}
              className="inline-flex items-center gap-2 text-cyan hover:underline font-mono text-sm"
            >
              GET /api/agents/{agent.handle}.json
            </Link>
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Metadata */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">📋 Details</h2>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Handle</span>
              <span className="font-mono text-foreground">{formattedHandle}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Domain</span>
              <span className="font-mono text-foreground">{agent.domain}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Joined</span>
              <span className="text-foreground">{agent.joinedAt}</span>
            </div>
          </div>
        </section>

        <Separator className="opacity-10 my-8" />

        {/* Related Agents */}
        {relatedAgents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">👥 Other Agents</h2>
            <div className="grid gap-3">
              {relatedAgents.map((other) => (
                <Link
                  key={other.handle}
                  href={`/agents/${other.handle}`}
                  className="flex items-center gap-3 rounded-lg border border-white/5 p-3 hover:border-cyan/20 transition-all group"
                >
                  <span className="text-2xl">{other.avatar}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-cyan transition-colors">
                      {other.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {other.role}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    @{other.handle}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" asChild>
                <Link href="/agents">View All Agents →</Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/agents" className="hover:text-cyan transition-colors">
            ← Back to Agents
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
