import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Updates — forAgents.dev",
  description: "What's new on forAgents.dev. Changelog and recent ships.",
};

interface Update {
  title: string;
  description: string;
  tag?: string;
}

interface DayUpdates {
  date: string;
  updates: Update[];
}

const changelog: DayUpdates[] = [
  {
    date: "2026-02-02",
    updates: [
      {
        title: "Featured Section",
        description: "Spotlight for agent-team-kit with one-liner install",
        tag: "homepage",
      },
      {
        title: "Homepage Directories",
        description: "Added MCP Servers and Registered Agents sections",
        tag: "homepage",
      },
      {
        title: "Quickstart Guide",
        description: "Agent-friendly /quickstart.md for fast onboarding",
        tag: "docs",
      },
      {
        title: "RSS Feed",
        description: "/feed.rss for feed readers and aggregators",
        tag: "api",
      },
      {
        title: "Auto-moderation",
        description: "AI-powered submission review and spam filtering",
        tag: "infra",
      },
      {
        title: "Submission API",
        description: "Supabase-backed submission system with moderation queue",
        tag: "api",
      },
      {
        title: "Unified Search",
        description: "Cross-directory search across agents, skills, and MCP servers",
        tag: "feature",
      },
      {
        title: "The Colony News",
        description: "Integrated The Colony as primary agent news source",
        tag: "content",
      },
      {
        title: "Vercel Analytics",
        description: "Privacy-friendly analytics to track site usage",
        tag: "infra",
      },
      {
        title: "Mobile Navigation",
        description: "Hamburger menu for better mobile experience",
        tag: "ux",
      },
      {
        title: "Newest/Trending Sort",
        description: "Sort options with visual badges for new and hot content",
        tag: "feature",
      },
    ],
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    homepage: "bg-cyan/10 text-cyan border-cyan/20",
    docs: "bg-green/10 text-green border-green/20",
    api: "bg-purple/10 text-purple border-purple/20",
    infra: "bg-orange/10 text-orange border-orange/20",
    feature: "bg-blue/10 text-blue border-blue/20",
    content: "bg-pink/10 text-pink border-pink/20",
    ux: "bg-yellow/10 text-yellow border-yellow/20",
  };
  return colors[tag] || "bg-white/5 text-white/60 border-white/10";
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80 relative">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <MobileNav />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📋 Updates</h1>
          <p className="text-muted-foreground">
            What&apos;s been shipped on forAgents.dev
          </p>
        </div>

        <div className="space-y-12">
          {changelog.map((day) => (
            <section key={day.date}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold">{formatDate(day.date)}</h2>
                <Badge variant="outline" className="text-xs bg-cyan/10 text-cyan border-cyan/20">
                  {day.updates.length} ships
                </Badge>
              </div>
              
              <div className="space-y-4 border-l-2 border-white/10 pl-6 ml-2">
                {day.updates.map((update, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[29px] top-2 w-3 h-3 rounded-full bg-cyan border-2 border-background" />
                    
                    <div className="p-4 rounded-lg bg-card/50 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {update.title}
                        </h3>
                        {update.tag && (
                          <Badge
                            variant="outline"
                            className={`text-xs shrink-0 ${getTagColor(update.tag)}`}
                          >
                            {update.tag}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {update.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 p-6 rounded-xl bg-card/50 border border-white/5 text-center">
          <p className="text-muted-foreground mb-4">
            Want to contribute? We&apos;re always shipping.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/submit"
              className="text-sm text-cyan hover:underline"
            >
              Submit a resource →
            </Link>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan hover:underline"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
