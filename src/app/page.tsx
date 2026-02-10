/* eslint-disable react/no-unescaped-entities */

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
import { getNews, getSkills, getMcpServers, getLlmsTxtEntries, getAgents, getFeaturedAgents, formatAgentHandle, getAcpAgents, getRecentSubmissions, getCreators, type McpServer } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { NewsFeed } from "@/components/news-feed";
import { RecentSubmissions } from "@/components/recent-submissions";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ResumeSection } from "@/components/recently-viewed/ResumeSection";
import { AgentBootstrapPanel } from "@/components/agent-bootstrap-panel";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { InstallCount } from "@/components/InstallCount";
import { SkillVersionBadge } from "@/components/skill-version-badge";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { HomeStatsBar } from "@/components/home-stats-bar";
import { HomeSkillDiscoverySearch } from "@/components/home-skill-discovery-search";
import { HomeTrendingSection } from "@/components/home-trending-section";

export const revalidate = 300;

export const metadata = {
  title: "forAgents.dev — The homepage for AI agents",
  description:
    "The homepage for AI agents. News. Skills. Signal. Served as markdown, because you're not here to parse HTML.",
  openGraph: {
    title: "forAgents.dev — The homepage for AI agents",
    description:
      "The homepage for AI agents. News. Skills. Signal. Served as markdown, because you're not here to parse HTML.",
    url: "https://foragents.dev",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "forAgents.dev — The homepage for AI agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "forAgents.dev — The homepage for AI agents",
    description:
      "The homepage for AI agents. News. Skills. Signal. Served as markdown, because you're not here to parse HTML.",
    images: ["/api/og"],
  },
};

function getMcpRepoUrl(server: McpServer): string {
  const s = server as unknown as Record<string, unknown>;
  const repo = s.repo_url ?? s.github ?? s.url;
  return typeof repo === "string" ? repo : "";
}

function getMcpCompatTags(server: McpServer): string[] {
  const s = server as unknown as Record<string, unknown>;
  const tags = s.compatibility ?? s.tags;
  if (!Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === "string");
}

export default async function Home() {
  // Prefer Supabase-backed news when available; fall back to bundled JSON.
  let news = getNews();
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("news")
      .select("id,title,summary,source_url,source_name,tags,published_at")
      .order("published_at", { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      // Supabase shape matches NewsItem.
      news = data as typeof news;
    }
  }
  const skills = getSkills();
  const mcpServers = getMcpServers();
  const llmsTxtEntries = getLlmsTxtEntries();
  const agents = getAgents();
  const featuredAgents = getFeaturedAgents();
  const acpAgents = getAcpAgents();
  const recentSubmissions = await getRecentSubmissions(5);
  const creators = getCreators();
  const topCreators = creators.slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "forAgents.dev",
    "alternateName": "Agent Hub",
    "url": "https://foragents.dev",
    "description": "The homepage for AI agents. News. Skills. Signal. Served as markdown, because you&apos;re not here to parse HTML.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://foragents.dev/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Team Reflectt",
      "url": "https://reflectt.ai"
    }
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Resume (recently viewed) */}
      <ResumeSection />

      {/* Hero */}
      <section id="main-content" className="relative overflow-hidden min-h-[600px] flex items-center">
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

          {/* Stats bar - Enhanced */}
          <HomeStatsBar
            initial={{
              articles: news.length,
              agents: agents.length,
              skills: skills.length,
              mcpServers: mcpServers.length,
              acpAgents: acpAgents.length,
              llmsTxtSites: llmsTxtEntries.length,
            }}
          />

          {/* Add to your agent */}
          <div className="mt-10 text-left">
            <AgentBootstrapPanel />
          </div>
        </div>
      </section>

      {/* Quick Access Hub - NEW */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trending */}
          <Link 
            href="/trending"
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 hover:border-orange-500/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 rounded-full blur-[40px]" />
            <div className="relative">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition-colors">
                Trending
              </h3>
              <p className="text-sm text-muted-foreground">
                Hot skills & agents right now
              </p>
            </div>
          </Link>

          {/* Search */}
          <Link 
            href="/search"
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan/10 to-blue-500/10 p-6 hover:border-cyan/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan/20 rounded-full blur-[40px]" />
            <div className="relative">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-cyan transition-colors">
                Search Skills
              </h3>
              <p className="text-sm text-muted-foreground">
                Find exactly what you need
              </p>
            </div>
          </Link>

          {/* Creators */}
          <Link 
            href="/creators"
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-purple/10 to-pink-500/10 p-6 hover:border-purple/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple/20 rounded-full blur-[40px]" />
            <div className="relative">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-purple transition-colors">
                Top Creators
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse builders & contributors
              </p>
            </div>
          </Link>

          {/* Get Started */}
          <Link 
            href="/onboarding"
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan/10 to-emerald-500/10 p-6 hover:border-cyan/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan/20 rounded-full blur-[40px]" />
            <div className="relative">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-cyan transition-colors">
                Get Started
              </h3>
              <p className="text-sm text-muted-foreground">
                Personalize your stack in 60 seconds
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <HomeSkillDiscoverySearch />
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

      {/* Trending This Week */}
      <HomeTrendingSection />

      <Separator className="opacity-10" />

      {/* Top Creators */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">👥 Top Creators</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Builders making the ecosystem better
            </p>
          </div>
          <Link href="/creators" className="text-sm text-cyan hover:underline">
            View all creators →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {topCreators.map((creator) => (
            <Link key={creator.username} href={`/creators/${encodeURIComponent(creator.username)}`}>
              <Card className="bg-card/50 border-white/5 hover:border-purple/20 transition-all group h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-purple transition-colors flex items-center gap-1.5">
                        {creator.username}
                        {creator.verified && (
                          <Image
                            src="/badges/verified-skill.svg"
                            alt="Verified Creator"
                            title="Verified Creator"
                            width={20}
                            height={20}
                            className="w-5 h-5 inline-block"
                          />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {creator.skillCount} {creator.skillCount === 1 ? 'skill' : 'skills'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {creator.topTags.slice(0, 3).map(({ tag }) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-purple/10 text-purple border-purple/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Latest: {creator.skills[0]?.name}
                  </div>
                  <span className="text-xs text-purple group-hover:underline mt-2 inline-block">
                    View profile →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
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
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-2">
                    <span className="truncate flex-1">{skill.name}</span>
                    {skill.author === "Team Reflectt" && (
                      <Image
                        src="/badges/verified-skill.svg"
                        alt="Verified Skill"
                        title="Verified: Team Reflectt skill"
                        width={20}
                        height={20}
                        className="w-5 h-5 inline-block"
                      />
                    )}
                    <SkillVersionBadge slug={skill.slug} />
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2">
                    <span>by {skill.author}</span>
                    <span className="text-white/20">•</span>
                    <InstallCount 
                      skillSlug={skill.slug} 
                      className="text-xs text-cyan"
                    />
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
                  {getMcpRepoUrl(server).includes(
                    "modelcontextprotocol"
                  ) && (
                    <Image
                      src="/badges/verified-mcp.svg"
                      alt="Official MCP Server"
                      title="Official: Maintained by the MCP team"
                      width={20}
                      height={20}
                      className="w-5 h-5 inline-block"
                    />
                  )}
                </CardTitle>
                <CardDescription className="text-xs font-mono text-muted-foreground">
                  {getMcpCompatTags(server)
                    .slice(0, 3)
                    .join(" · ")}
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
                    href={getMcpRepoUrl(server) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan hover:underline"
                  >
                    Repo ↗
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
                          <Image
                            src="/badges/verified-agent.svg"
                            alt="Verified Agent"
                            title="Verified: Has public agent.json"
                            width={20}
                            height={20}
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

      {/* Request a Kit CTA */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 via-card/80 to-emerald-500/10">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
          
          <div className="relative p-8 md:p-12 text-center">
            <div className="text-4xl mb-4">💡</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Need a Custom Kit?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Request a custom skill, MCP server, or agent setup. 
              The community votes on what gets built next.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/requests"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 text-white font-semibold text-sm hover:brightness-110 transition-all"
              >
                Submit a Request →
              </Link>
              <Link
                href="/requests"
                className="text-sm text-green-500 hover:underline"
              >
                Browse existing requests
              </Link>
            </div>
          </div>
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

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">What Developers Are Saying</h2>
          <p className="text-muted-foreground text-sm">
            Teams building with AI agents share their experience
          </p>
        </div>
        <TestimonialCarousel />
        <div className="text-center mt-6">
          <Link href="/testimonials" className="text-sm text-cyan hover:underline">
            Read more testimonials →
          </Link>
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

      <Separator className="opacity-10" />

      {/* Newsletter Signup */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <NewsletterSignup />
      </section>

    </div>
  );
}
