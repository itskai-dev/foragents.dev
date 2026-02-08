import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Newsletter — forAgents.dev",
  description:
    "Subscribe to the forAgents.dev newsletter for weekly roundups, new skills spotlight, community highlights, and platform updates.",
  openGraph: {
    title: "Newsletter — forAgents.dev",
    description:
      "Subscribe to the forAgents.dev newsletter for weekly roundups, new skills spotlight, community highlights, and platform updates.",
    url: "https://foragents.dev/newsletter",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter — forAgents.dev",
    description:
      "Subscribe to the forAgents.dev newsletter for weekly roundups, new skills spotlight, community highlights, and platform updates.",
  },
};

type NewsletterIssue = {
  issue: number;
  date: string;
  title: string;
  preview: string;
  slug: string;
};

const pastIssues: NewsletterIssue[] = [
  {
    issue: 6,
    date: "2026-02-07",
    title: "Weekly Roundup: 30+ Pages Shipped & API Playground Launch",
    preview:
      "This week we made history by shipping over 30 pages in a single night! From enhanced skill pages to the new API playground, discover what&apos;s new in the forAgents.dev ecosystem. Plus: featured creators and trending skills.",
    slug: "weekly-roundup-feb-7-2026",
  },
  {
    issue: 5,
    date: "2026-02-01",
    title: "New Skills Spotlight: Advanced Automation & AI Integrations",
    preview:
      "Explore the latest skills added to our marketplace this week, including advanced automation tools, AI model integrations, and workflow orchestration capabilities. Learn how top creators are pushing the boundaries of agent development.",
    slug: "skills-spotlight-feb-1-2026",
  },
  {
    issue: 4,
    date: "2026-01-25",
    title: "Community Highlights: Top Contributors & Featured Projects",
    preview:
      "Meet the creators making waves in the agent community! This week&apos;s highlights include innovative skill kits, collaborative projects, and success stories from builders using forAgents.dev to power their AI workflows.",
    slug: "community-highlights-jan-25-2026",
  },
  {
    issue: 3,
    date: "2026-01-18",
    title: "Platform Updates: Dark Mode, Analytics & Creator Dashboard",
    preview:
      "We&apos;ve rolled out major platform improvements including beautiful dark mode support, creator analytics dashboards, and enhanced search functionality. Learn how these updates can help you build better agents faster.",
    slug: "platform-updates-jan-18-2026",
  },
  {
    issue: 2,
    date: "2026-01-11",
    title: "Weekly Roundup: MCP Servers & Skill Discovery Improvements",
    preview:
      "Dive into this week&apos;s additions including new MCP server integrations, improved skill discovery with advanced filtering, and a behind-the-scenes look at how we&apos;re building the world&apos;s largest agent resource library.",
    slug: "weekly-roundup-jan-11-2026",
  },
  {
    issue: 1,
    date: "2026-01-04",
    title: "Welcome to forAgents.dev: Building the Future of AI Agents",
    preview:
      "Welcome to our inaugural newsletter! Learn about our vision for forAgents.dev, discover the first wave of skills and kits, meet our founding creators, and get a sneak peek at what&apos;s coming next in the agent ecosystem.",
    slug: "welcome-jan-4-2026",
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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

      {/* Subscribe Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📬 Newsletter
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get weekly roundups, new skills spotlight, community highlights, and
            platform updates delivered straight to your inbox
          </p>
        </div>

        {/* Subscribe Form */}
        <Card className="bg-card/50 border-white/5 max-w-xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground block mb-2"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="bg-background/50 border-white/10 focus:border-[#06D6A0] transition-colors"
                />
              </div>
              <Button className="w-full bg-[#06D6A0] text-[#0a0a0a] font-semibold hover:brightness-110 transition-all">
                Subscribe
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll never share your email. Unsubscribe anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Past Issues Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            📚 Past Issues
          </h2>
          <p className="text-muted-foreground">
            Catch up on what you&apos;ve missed
          </p>
        </div>

        {/* Issues List */}
        <div className="space-y-6">
          {pastIssues.map((issue) => (
            <Card
              key={issue.issue}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-[#06D6A0] font-semibold">
                        Issue #{issue.issue}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <time className="text-sm font-mono text-muted-foreground">
                        {formatDate(issue.date)}
                      </time>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{issue.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {issue.preview}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <Link
                    href={`/newsletter/${issue.slug}`}
                    className="inline-flex items-center text-sm text-[#06D6A0] hover:underline font-medium"
                  >
                    Read issue →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Archive CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for older issues?
          </p>
          <Link
            href="/newsletter/archive"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-white/10 text-sm font-medium hover:border-[#06D6A0]/50 hover:text-[#06D6A0] transition-all"
          >
            View Full Archive
          </Link>
        </div>
      </section>

    </div>
  );
}
