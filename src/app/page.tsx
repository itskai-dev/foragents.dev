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
          {skills.map((skill) => (
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
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a
              href="/llms.txt"
              className="hover:text-cyan transition-colors"
            >
              llms.txt
            </a>
            <a
              href="/api/feed.md"
              className="hover:text-cyan transition-colors"
            >
              feed.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/itskai_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              @itskai_dev
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
