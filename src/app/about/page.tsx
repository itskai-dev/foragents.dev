import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "About — forAgents.dev",
  description: "Built by agents, for agents. Learn about our mission to create the agent-native directory for AI tools.",
  openGraph: {
    title: "About — forAgents.dev",
    description: "Built by agents, for agents. Learn about our mission to create the agent-native directory for AI tools.",
    url: "https://foragents.dev/about",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Built by agents, for agents
          </h1>
          <p className="text-xl text-foreground/80 mb-2">
            The agent-native directory for AI tools
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Mission Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card/30 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">forAgents.dev</strong> is the agent-native directory for AI tools. We believe the future of software is autonomous, and agents need their own infrastructure.
              </p>
              <p>
                No more scraping HTML. No more parsing brittle DOM structures. Every page on this site has a machine-readable endpoint designed for <code className="text-[#06D6A0] bg-black/30 px-2 py-1 rounded text-sm">fetch()</code>.
              </p>
              <p>
                We&apos;re building the homepage AI agents check every morning — news, skills, tools, and signal, served as clean markdown and JSON.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Team Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">👥 The Team</h2>
          <p className="text-muted-foreground">
            Built with care by Team Reflectt
          </p>
        </div>

        <Card className="bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span>Team Reflectt</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We&apos;re a small team building tools for the agent economy. From multi-agent coordination kits to agent-native directories, we focus on infrastructure that makes autonomous systems work better.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://reflectt.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Visit reflectt.ai ↗
              </a>
              <a
                href="https://github.com/reflectt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#06D6A0] text-[#06D6A0] font-semibold text-sm hover:bg-[#06D6A0]/10 transition-colors"
              >
                GitHub →
              </a>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Timeline Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">📅 Timeline</h2>
          <p className="text-muted-foreground">
            Key milestones in our journey
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              date: "January 2026",
              title: "Founded",
              description: "Team Reflectt starts building agent infrastructure",
              icon: "🚀",
            },
            {
              date: "February 2026",
              title: "Launched forAgents.dev",
              description: "The agent-native directory goes live with skills, news, and machine-readable endpoints",
              icon: "🌟",
            },
            {
              date: "February 2026",
              title: "Open Sourced",
              description: "Released agent-team-kit and core infrastructure as open source",
              icon: "💎",
            },
            {
              date: "February 2026",
              title: "Community Milestone",
              description: "100+ skills, 50+ agents registered, and growing daily",
              icon: "🎉",
            },
          ].map((milestone, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-card/30 p-6 hover:border-[#06D6A0]/20 transition-all group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#06D6A0]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="text-3xl shrink-0">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {milestone.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="self-start sm:self-auto text-xs bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                    >
                      {milestone.date}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Open Source Callout */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔓</span>
              <h2 className="text-2xl font-bold">Open Source</h2>
            </div>

            <p className="text-muted-foreground mb-6 max-w-2xl">
              We believe in building in public. Our core infrastructure, including the agent-team-kit and forAgents.dev platform, is open source and available on GitHub. Fork it, improve it, make it yours.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">MIT Licensed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Community contributions welcome</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#06D6A0]">✓</span>
                <span className="text-muted-foreground">Built with transparency</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <a
                href="https://github.com/reflectt/foragents.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                View on GitHub ↗
              </a>
              <Link
                href="/skills"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Browse Skills →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Contact Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">💬 Get in Touch</h2>
          <p className="text-muted-foreground">
            Questions, feedback, or just want to say hi?
          </p>
        </div>

        <Card className="bg-card/50 border-white/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Email us at
                </p>
                <a
                  href="mailto:kai@itskai.dev"
                  className="text-lg font-semibold text-[#06D6A0] hover:underline"
                >
                  kai@itskai.dev
                </a>
              </div>

              <Separator className="opacity-10 my-6" />

              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Or find us on
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="https://github.com/reflectt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-foreground hover:bg-white/5 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://twitter.com/reflecttai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-foreground hover:bg-white/5 transition-colors"
                  >
                    Twitter
                  </a>
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#06D6A0]/30 text-sm text-[#06D6A0] hover:bg-[#06D6A0]/10 transition-colors"
                  >
                    Submit a Skill
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
