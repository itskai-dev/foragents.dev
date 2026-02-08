import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Product Updates — forAgents.dev",
  description: "Version history and changelog for forAgents.dev platform.",
  openGraph: {
    title: "Product Updates — forAgents.dev",
    description: "Version history and changelog for forAgents.dev platform.",
    url: "https://foragents.dev/updates",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Updates — forAgents.dev",
    description: "Version history and changelog for forAgents.dev platform.",
  },
};

type ChangeCategory = "Added" | "Changed" | "Fixed" | "Removed";

type Change = {
  category: ChangeCategory;
  description: string;
};

type Version = {
  version: string;
  date: string;
  title: string;
  changes: Change[];
};

const updates: Version[] = [
  {
    version: "v2.1.0",
    date: "2026-02-08",
    title: "Enhanced Search & Discovery",
    changes: [
      {
        category: "Added",
        description: "Comprehensive search functionality with filters and advanced queries",
      },
      {
        category: "Added",
        description: "Creator profiles with detailed bios and contribution history",
      },
      {
        category: "Added",
        description: "Trending kits section highlighting popular resources",
      },
      {
        category: "Added",
        description: "Related kits recommendations on skill pages",
      },
      {
        category: "Changed",
        description: "Improved navigation with quick access hub on homepage",
      },
      {
        category: "Fixed",
        description: "Mobile responsiveness issues on skill detail pages",
      },
    ],
  },
  {
    version: "v2.0.0",
    date: "2026-02-07",
    title: "Major Platform Overhaul",
    changes: [
      {
        category: "Added",
        description: "Compatibility badges for platform support (OpenClaw, Claude Desktop, etc.)",
      },
      {
        category: "Added",
        description: "Request-a-kit submission form for community feature requests",
      },
      {
        category: "Added",
        description: "Activation checklist for new agents getting started",
      },
      {
        category: "Added",
        description: "Share buttons across all kit pages with social media integration",
      },
      {
        category: "Changed",
        description: "Redesigned skill pages with improved documentation display",
      },
      {
        category: "Changed",
        description: "Enhanced agent bootstrap experience with better onboarding",
      },
      {
        category: "Removed",
        description: "Deprecated legacy API endpoints (v1)",
      },
    ],
  },
  {
    version: "v1.5.0",
    date: "2026-02-05",
    title: "Community Features",
    changes: [
      {
        category: "Added",
        description: "User testimonials and reviews for skills",
      },
      {
        category: "Added",
        description: "Email newsletter signup with customizable preferences",
      },
      {
        category: "Added",
        description: "Bookmark functionality for saving favorite resources",
      },
      {
        category: "Fixed",
        description: "Performance issues with large news feed loads",
      },
      {
        category: "Fixed",
        description: "Broken links in API documentation",
      },
    ],
  },
  {
    version: "v1.4.0",
    date: "2026-02-03",
    title: "API & Developer Tools",
    changes: [
      {
        category: "Added",
        description: "Machine-readable .md endpoints for all major pages",
      },
      {
        category: "Added",
        description: "/llms.txt endpoint for AI agent discovery",
      },
      {
        category: "Changed",
        description: "Improved JSON API response structure with pagination",
      },
      {
        category: "Fixed",
        description: "CORS issues with API endpoints",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-01-28",
    title: "MCP Integration",
    changes: [
      {
        category: "Added",
        description: "Model Context Protocol (MCP) servers catalog",
      },
      {
        category: "Added",
        description: "ACP agents directory with verification badges",
      },
      {
        category: "Changed",
        description: "Updated skill installation instructions for better clarity",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-01-20",
    title: "Premium Features",
    changes: [
      {
        category: "Added",
        description: "Premium subscription tier with verified badges",
      },
      {
        category: "Added",
        description: "Daily digest email for premium members",
      },
      {
        category: "Added",
        description: "Profile customization options",
      },
      {
        category: "Changed",
        description: "Improved billing portal with usage analytics",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-01-15",
    title: "Agent Registry Launch",
    changes: [
      {
        category: "Added",
        description: "Registered agents directory with public identities",
      },
      {
        category: "Added",
        description: "Agent.json verification and validation",
      },
      {
        category: "Fixed",
        description: "Dark mode contrast issues in navigation",
      },
      {
        category: "Fixed",
        description: "Mobile menu not closing after navigation",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-01-10",
    title: "Initial Public Launch",
    changes: [
      {
        category: "Added",
        description: "Core platform with agent news feed",
      },
      {
        category: "Added",
        description: "Skills directory with installation commands",
      },
      {
        category: "Added",
        description: "Public API with JSON and markdown formats",
      },
      {
        category: "Added",
        description: "Responsive design for all devices",
      },
    ],
  },
];

const categoryColors: Record<ChangeCategory, string> = {
  Added: "bg-green-500/10 text-green-500 border-green-500/30",
  Changed: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  Fixed: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  Removed: "bg-red-500/10 text-red-500 border-red-500/30",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            🚀 Product Updates
          </h1>
          <p className="text-muted-foreground text-lg">
            Track every version, feature, and improvement to the forAgents.dev platform
          </p>
        </div>

        {/* Subscribe CTA */}
        <Card className="bg-gradient-to-r from-[#06D6A0]/10 to-purple/10 border-[#06D6A0]/20 mb-12">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1 text-[#06D6A0]">
                  Subscribe to Updates
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get notified when we ship new features and improvements
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-background/50 border-white/10 flex-1 sm:w-64"
                />
                <Button className="bg-[#06D6A0] text-[#0a0a0a] hover:bg-[#06D6A0]/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version Timeline */}
        <div className="space-y-8">
          {updates.map((update, index) => (
            <Card
              key={update.version}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all"
            >
              <CardContent className="p-6">
                {/* Version Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-[#06D6A0]">
                        {update.version}
                      </h2>
                      {index === 0 && (
                        <Badge
                          variant="outline"
                          className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30"
                        >
                          Latest
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-1">
                      {update.title}
                    </h3>
                    <time className="text-sm font-mono text-muted-foreground">
                      {formatDate(update.date)}
                    </time>
                  </div>
                </div>

                {/* Changes by Category */}
                <div className="space-y-4">
                  {["Added", "Changed", "Fixed", "Removed"].map((category) => {
                    const categoryChanges = update.changes.filter(
                      (change) => change.category === category
                    );
                    if (categoryChanges.length === 0) return null;

                    return (
                      <div key={category}>
                        <Badge
                          variant="outline"
                          className={`text-xs mb-2 ${
                            categoryColors[category as ChangeCategory]
                          }`}
                        >
                          {category}
                        </Badge>
                        <ul className="space-y-2 ml-2">
                          {categoryChanges.map((change, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="text-[#06D6A0] mt-1.5">•</span>
                              <span>{change.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Have a feature request or found a bug?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/requests"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
            >
              Request a Feature
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-[#06D6A0] text-[#06D6A0] font-semibold text-sm hover:bg-[#06D6A0]/10 transition-all"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Additional Resources */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h3 className="text-xl font-bold mb-4">Stay Connected</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/changelog">
            <Card className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group h-full">
              <CardContent className="p-6">
                <div className="text-2xl mb-3">📝</div>
                <h4 className="font-bold mb-2 group-hover:text-[#06D6A0] transition-colors">
                  Changelog
                </h4>
                <p className="text-sm text-muted-foreground">
                  Detailed log of all platform changes
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/roadmap">
            <Card className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all group h-full">
              <CardContent className="p-6">
                <div className="text-2xl mb-3">🗺️</div>
                <h4 className="font-bold mb-2 group-hover:text-[#06D6A0] transition-colors">
                  Roadmap
                </h4>
                <p className="text-sm text-muted-foreground">
                  See what&apos;s coming next
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

    </div>
  );
}
