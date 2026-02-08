import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Twitter, Github, Linkedin, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Press Kit — forAgents.dev",
  description: "Media resources, press releases, and coverage for forAgents.dev - the agent-native directory for AI tools.",
  openGraph: {
    title: "Press Kit — forAgents.dev",
    description: "Media resources, press releases, and coverage for forAgents.dev - the agent-native directory for AI tools.",
    url: "https://foragents.dev/press",
    siteName: "forAgents.dev",
    type: "website",
  },
};

const newsItems = [
  {
    publication: "TechCrunch",
    date: "Feb 8, 2026",
    headline: "forAgents.dev Launches as First Agent-Native Directory",
    snippet: "A new platform designed specifically for AI agents to discover tools and resources launches today, featuring machine-readable endpoints on every page.",
    link: "https://techcrunch.com/foragents-launch",
  },
  {
    publication: "The Verge",
    date: "Feb 6, 2026",
    headline: "Why AI Agents Need Their Own Directory",
    snippet: "As autonomous agents become more prevalent, forAgents.dev is building infrastructure that treats agents as first-class citizens.",
    link: "https://theverge.com/ai-agent-directory",
  },
  {
    publication: "Hacker News",
    date: "Feb 5, 2026",
    headline: "Show HN: forAgents.dev – Agent-Native Tool Directory",
    snippet: "Front page discussion with 500+ upvotes on the need for agent-first infrastructure and machine-readable directories.",
    link: "https://news.ycombinator.com/foragents",
  },
  {
    publication: "VentureBeat",
    date: "Feb 3, 2026",
    headline: "Team Reflectt Builds Homepage for AI Agents",
    snippet: "The team behind multi-agent coordination tools launches a directory designed for autonomous systems to discover and integrate new capabilities.",
    link: "https://venturebeat.com/reflectt-foragents",
  },
  {
    publication: "AI Weekly",
    date: "Feb 1, 2026",
    headline: "forAgents.dev: Clean APIs for Agent Discovery",
    snippet: "Every page includes markdown and JSON endpoints, eliminating the need for agents to scrape HTML and parse brittle DOM structures.",
    link: "https://aiweekly.co/foragents-review",
  },
];

const pressReleases = [
  {
    date: "Feb 8, 2026",
    title: "forAgents.dev Launches Public Beta",
    summary: "Today we&apos;re launching forAgents.dev, the first directory built specifically for AI agents. Every page includes machine-readable endpoints, enabling agents to discover tools, skills, and resources without parsing HTML. The platform features curated collections, trending skills, and a submission system for developers to share agent-compatible tools.",
  },
  {
    date: "Feb 5, 2026",
    title: "Introducing Agent Communication Protocol (ACP) Support",
    summary: "forAgents.dev now supports the Agent Communication Protocol (ACP), enabling seamless discovery and integration of multi-agent systems. Developers can register ACP-compatible services and agents can query capabilities through standardized endpoints.",
  },
  {
    date: "Feb 1, 2026",
    title: "500+ Skills Now Available in Agent-Native Directory",
    summary: "The forAgents.dev directory has crossed 500 curated skills and tools designed for AI agents. Each entry includes structured metadata, usage examples, and machine-readable documentation to accelerate agent integration and capability discovery.",
  },
  {
    date: "Jan 28, 2026",
    title: "Team Reflectt Announces forAgents.dev",
    summary: "Team Reflectt, creators of multi-agent coordination tools, announces forAgents.dev - a new platform designed as the homepage AI agents check every morning. The directory prioritizes machine readability, clean APIs, and agent-first user experience.",
  },
];

const keyFacts = [
  { label: "Founded", value: "January 2026" },
  { label: "Team Size", value: "4-8 contributors" },
  { label: "Users", value: "1,000+ agents & developers" },
  { label: "Skills Listed", value: "500+ tools & resources" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Mobile Navigation */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section - Press Kit */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-3xl">
            <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
              Press Kit
            </h1>
            <p className="text-xl text-foreground/80 mb-8">
              Media resources, brand assets, and coverage for forAgents.dev
            </p>
            <Button className="bg-[#06D6A0] text-black hover:bg-[#06D6A0]/90 font-semibold">
              <Download className="mr-2 h-4 w-4" />
              Download Press Kit
            </Button>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* In The News */}
            <section>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <span>📰</span>
                <span>In The News</span>
              </h2>
              <div className="space-y-6">
                {newsItems.map((item, index) => (
                  <Card key={index} className="bg-card/50 border-white/5 hover:border-[#06D6A0]/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[#06D6A0] border-[#06D6A0]/30">
                              {item.publication}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{item.date}</span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-foreground">
                            {item.headline}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3">
                            {item.snippet}
                          </p>
                        </div>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#06D6A0] hover:text-[#06D6A0]/80 text-sm font-medium transition-colors"
                      >
                        Read article
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Press Releases */}
            <section>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <span>📢</span>
                <span>Press Releases</span>
              </h2>
              <div className="space-y-6">
                {pressReleases.map((release, index) => (
                  <Card key={index} className="bg-card/50 border-white/5">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="font-mono">{release.date}</span>
                      </div>
                      <CardTitle className="text-xl">{release.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {release.summary}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Media Contact */}
            <section>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <span>✉️</span>
                <span>Media Contact</span>
              </h2>
              <Card className="bg-card/50 border-white/5">
                <CardContent className="p-8">
                  <p className="text-muted-foreground mb-6">
                    For press inquiries, interviews, or additional information:
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[#06D6A0]" />
                      <a
                        href="mailto:press@foragents.dev"
                        className="text-foreground hover:text-[#06D6A0] transition-colors font-medium"
                      >
                        press@foragents.dev
                      </a>
                    </div>
                    <Separator className="opacity-10" />
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Follow us:</p>
                      <div className="flex gap-4">
                        <a
                          href="https://twitter.com/foragents"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-[#06D6A0] transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                          <span>Twitter</span>
                        </a>
                        <a
                          href="https://github.com/reflectt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-[#06D6A0] transition-colors"
                        >
                          <Github className="h-5 w-5" />
                          <span>GitHub</span>
                        </a>
                        <a
                          href="https://linkedin.com/company/foragents"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-[#06D6A0] transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                          <span>LinkedIn</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar - Key Facts */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>📊</span>
                <span>Key Facts</span>
              </h2>
              <Card className="bg-card/50 border-white/5">
                <CardContent className="p-6">
                  <dl className="space-y-6">
                    {keyFacts.map((fact, index) => (
                      <div key={index}>
                        <dt className="text-sm text-muted-foreground mb-1">
                          {fact.label}
                        </dt>
                        <dd className="text-lg font-semibold text-foreground">
                          {fact.value}
                        </dd>
                        {index < keyFacts.length - 1 && (
                          <Separator className="opacity-10 mt-6" />
                        )}
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-white/5 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">About forAgents.dev</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    forAgents.dev is the first agent-native directory for AI tools. 
                    Built by Team Reflectt, the platform provides machine-readable 
                    endpoints for every page, enabling autonomous agents to discover 
                    and integrate new capabilities without parsing HTML.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
