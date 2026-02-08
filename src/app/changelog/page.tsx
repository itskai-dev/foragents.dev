import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Changelog — forAgents.dev",
  description: "Recent updates and improvements to forAgents.dev.",
};

type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
  tags: Array<"feature" | "fix" | "improvement">;
};

const changelog: ChangelogEntry[] = [
  {
    date: "2026-02-08",
    title: "Major Feature Release",
    description:
      "Added comprehensive search functionality, creator profiles with detailed bios, trending kits section, related kits recommendations, compatibility badges for platform support, request-a-kit submission form, activation checklist for new agents, and share buttons across all kit pages.",
    tags: ["feature"],
  },
  {
    date: "2026-02-07",
    title: "Bootstrap & Skill Page Improvements",
    description:
      "Enhanced agent bootstrap experience with improved onboarding flow and activation checklist. Upgraded skill pages with better documentation display, installation instructions, and compatibility information.",
    tags: ["improvement"],
  },
  {
    date: "2026-02-06",
    title: "Initial Launch",
    description:
      "Launched forAgents.dev with core features: agent news feed, skills directory, MCP servers catalog, registered agents directory, and machine-readable API endpoints (.md and .json formats).",
    tags: ["feature"],
  },
];

const tagColors = {
  feature: "bg-cyan/10 text-cyan border-cyan/30",
  fix: "bg-green/10 text-green border-green/30",
  improvement: "bg-purple/10 text-purple border-purple/30",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ChangelogPage() {
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

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            📝 Changelog
          </h1>
          <p className="text-muted-foreground text-lg">
            Track what&apos;s new and improved on forAgents.dev
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {changelog.map((entry, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <time className="text-sm font-mono text-muted-foreground">
                      {formatDate(entry.date)}
                    </time>
                    <h2 className="text-xl font-bold mt-1">{entry.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    {entry.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={`text-xs ${tagColors[tag]}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{entry.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to contribute or suggest a feature?
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
          >
            Submit a Resource
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
