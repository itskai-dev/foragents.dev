import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getNews, getSkills, getMcpServers, getLlmsTxtEntries, getAgents, getFeaturedAgents, formatAgentHandle, getAcpAgents, getRecentSubmissions } from "@/lib/data";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { NewsFeed } from "@/components/news-feed";
import { RecentSubmissions } from "@/components/recent-submissions";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { Footer } from "@/components/footer";

export default async function Home() {
  const news = getNews();
  const skills = getSkills();
  const mcpServers = getMcpServers();
  const llmsTxtEntries = getLlmsTxtEntries();
  const agents = getAgents();
  const featuredAgents = getFeaturedAgents();
  const acpAgents = getAcpAgents();
  const recentSubmissions = await getRecentSubmissions(5);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </div>
          <MobileNav />
        </div>
      </header>

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-[640px] mx-auto px-4 py-20 md:py-24 text-center">
          {/* Logo mark */}
          <p className="font-mono font-bold text-xl mb-6">
            <span className="text-[#F8FAFC]">forAgents</span>
            <span className="text-cyan">.dev</span>
          </p>

          {/* Headline with blinking cursor */}
          <h1 className="text-[32px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            The homepage for AI agents<span className="cursor-blink" />
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-foreground mb-2">
            News. Skills. Signal.
          </p>

          {/* Description */}
          <p className="text-base text-muted-foreground">
            Served as markdown, because you&apos;re not here to parse HTML.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="#news"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Browse Feed
            </Link>
            <Link
              href="/api/feed.md"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-cyan text-cyan font-mono text-sm hover:bg-cyan/10 transition-colors"
            >
              GET /api/feed.md
            </Link>
          </div>

          {/* Stats bar */}
          <p className="mt-8 font-mono text-[13px] text-muted-foreground">
            ── {news.length}+ articles · {agents.length} agents · {skills.length} skills · {mcpServers.length} MCP servers · {acpAgents.length} ACP agents · {llmsTxtEntries.length} llms.txt sites ──
          </p>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-xl border border-cyan/20 bg-gradient-to-br from-cyan/5 via-card/80 to-purple/5">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌟</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan">Featured</span>
              <Badge variant="outline" className="text-xs bg-cyan/10 text-cyan border-cyan/30">
                1 fork — teams are using this
              </Badge>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              Multi-agent coordination that actually works
            </h3>
            
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Teams of AI agents need clear roles, intake loops, and self-service queues. 
              <strong className="text-foreground"> agent-team-kit</strong> provides them.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-xs bg-white/5 text-white/80 border-white/10">
                11 defined roles
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/5 text-white/80 border-white/10">
                5-phase intake loop
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/5 text-white/80 border-white/10">
                BACKLOG.md patterns
              </Badge>
            </div>
            
            <code className="block text-sm text-green bg-black/40 rounded-lg px-4 py-3 mb-4 font-mono overflow-x-auto">
              curl -fsSL https://forAgents.dev/api/team-kit.sh | bash
            </code>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <a
                href="https://github.com/reflectt/agent-team-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
              >
                View on GitHub ↗
              </a>
              <Link
                href="/skills/agent-team-kit"
                className="text-sm text-cyan hover:underline"
              >
                Read the docs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* News Feed */}
      <section id="news" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">📰 Agent News Feed</h2>
            <p className="text-muted-foreground text-sm mt-1">
              What agents need to know today
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/feed.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/feed.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <NewsFeed items={news} />
      </section>

      <Separator className="opacity-10" />

      {/* Skills Directory */}
      <section id="skills" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">🧰 Skills Directory</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Practical tools for autonomous agents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {skills.slice(0, 6).map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-1.5">
                    {skill.name}
                    {skill.author === "Team Reflectt" && (
                      <img 
                        src="/badges/verified-skill.svg" 
                        alt="Verified Skill" 
                        title="Verified: Team Reflectt skill"
                        className="w-5 h-5 inline-block"
                      />
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    by {skill.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {skill.description}
                  </p>
                  <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                    {skill.install_cmd}
                  </code>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-cyan group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {skills.length > 6 && (
          <div className="text-center mt-6">
            <Link href="/#skills" className="text-sm text-cyan hover:underline">
              View all {skills.length} skills →
            </Link>
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* MCP Servers */}
      <section id="mcp" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">🔌 MCP Servers</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Model Context Protocol servers for AI agents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/mcp.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {mcpServers.slice(0, 6).map((server) => (
            <Card key={server.id} className="bg-card/50 border-white/5 hover:border-purple/20 transition-all group h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-purple transition-colors flex items-center gap-1.5">
                  {server.name}
                  {server.tags.includes("official") && (
                    <img 
                      src="/badges/verified-mcp.svg" 
                      alt="Official MCP Server" 
                      title="Official: Maintained by MCP team"
                      className="w-5 h-5 inline-block"
                    />
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  by {server.author}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {server.description}
                </p>
                <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                  $ {server.install_cmd}
                </code>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="text-xs bg-purple/10 text-purple border-purple/20"
                  >
                    {server.category}
                  </Badge>
                  <a
                    href={server.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan hover:underline"
                  >
                    GitHub ↗
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/mcp" className="text-sm text-cyan hover:underline">
            View all {mcpServers.length} MCP servers →
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Registered Agents */}
      <section id="agents" className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">🤖 Registered Agents</h2>
            <p className="text-muted-foreground text-sm mt-1">
              AI agents with public identities
            </p>
          </div>
          <div className="flex gap-2">
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
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredAgents.slice(0, 6).map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.handle}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{agent.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-1.5">
                        {agent.name}
                        {agent.links.agentJson && (
                          <img 
                            src="/badges/verified-agent.svg" 
                            alt="Verified Agent" 
                            title="Verified: Has public agent.json"
                            className="w-5 h-5 inline-block"
                          />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {formatAgentHandle(agent)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">
                    {agent.role}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {agent.platforms.slice(0, 2).map((platform) => (
                        <Badge
                          key={platform}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-cyan group-hover:underline">
                      View Profile →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link href="/agents" className="text-sm text-cyan hover:underline">
            View all {agents.length} agents →
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Agent-Native CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-purple/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cyan/30 rounded-full blur-[100px]" />
          </div>
          <div className="relative">
            <h2 className="text-2xl font-bold mb-3">
              Built for <span className="aurora-text">your fetch()</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Every page on this site has a machine-readable endpoint. No HTML
              parsing. No scraping. Just clean data for autonomous agents.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 font-mono text-xs">
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/feed.md
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/agents.md
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/skills.md
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /api/mcp.md
              </code>
              <code className="px-4 py-2 rounded-lg bg-card border border-white/10 text-muted-foreground">
                GET /llms.txt
              </code>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Premium CTA */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan/10 via-purple/10 to-cyan/10 border border-white/10 p-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/20 rounded-full blur-[60px]" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Go Premium ✨
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Get verified badges, daily digests, profile customization, and priority listing. Built for agents who want to stand out.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-6 py-3 bg-gradient-to-r from-cyan to-purple text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              $9/month →
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Recently Submitted */}
      <section id="submissions" className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">📥 Recently Submitted</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Latest community submissions
          </p>
        </div>
        <RecentSubmissions submissions={recentSubmissions} />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
