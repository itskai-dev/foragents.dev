import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "What&apos;s New — forAgents.dev",
  description: "Latest announcements and feature launches from forAgents.dev.",
  openGraph: {
    title: "What&apos;s New — forAgents.dev",
    description: "Latest announcements and feature launches from forAgents.dev.",
    url: "https://foragents.dev/whats-new",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What&apos;s New — forAgents.dev",
    description: "Latest announcements and feature launches from forAgents.dev.",
  },
};

type Announcement = {
  date: string;
  title: string;
  description: string;
  category: "Feature" | "Update" | "Launch";
  link: string;
};

const announcements: Announcement[] = [
  {
    date: "2026-02-08",
    title: "30+ Pages Shipped in One Night!",
    description:
      "We shipped over 30 new pages across the platform in a single night, including enhanced skill pages, creator profiles, community sections, and comprehensive documentation. This massive update brings unprecedented depth to the forAgents.dev ecosystem.",
    category: "Launch",
    link: "/changelog",
  },
  {
    date: "2026-02-07",
    title: "API Playground Now Live",
    description:
      "Explore and test our machine-readable API endpoints directly in your browser. The new API playground supports .md and .json formats for all resources, making it easier than ever to integrate forAgents.dev into your workflows.",
    category: "Feature",
    link: "/api",
  },
  {
    date: "2026-02-06",
    title: "Dark Mode Support Added",
    description:
      "Experience forAgents.dev with beautiful dark mode support. The sleek bg-[#0a0a0a] background paired with cyan (#06D6A0) accents creates a stunning, eye-friendly interface perfect for late-night agent building sessions.",
    category: "Feature",
    link: "/",
  },
  {
    date: "2026-02-05",
    title: "Creator Analytics Dashboard",
    description:
      "Creators can now track engagement, downloads, and community impact with our new analytics dashboard. Gain insights into how your skills, kits, and contributions are helping the agent community grow.",
    category: "Feature",
    link: "/creators",
  },
  {
    date: "2026-02-04",
    title: "Skill Submission Form Available",
    description:
      "Share your custom skills with the community! Our new submission form makes it easy to contribute your own skills, MCP servers, and agent configurations. Help build the world&apos;s largest agent resource library.",
    category: "Launch",
    link: "/submit",
  },
  {
    date: "2026-02-03",
    title: "Community Page Launched",
    description:
      "Connect with other agent builders, share ideas, and collaborate on projects through our brand new community page. Discover trending discussions, featured creators, and the latest agent innovations from around the world.",
    category: "Launch",
    link: "/community",
  },
];

const categoryColors = {
  Feature: "bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30",
  Update: "bg-purple/10 text-purple border-purple/30",
  Launch: "bg-cyan/10 text-cyan border-cyan/30",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function WhatsNewPage() {
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

      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            🎉 What&apos;s New
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay up to date with the latest features, updates, and launches
          </p>
        </div>

        {/* Announcements Feed */}
        <div className="space-y-6">
          {announcements.map((announcement, index) => (
            <Card
              key={index}
              className="bg-card/50 border-white/5 hover:border-[#06D6A0]/20 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <time className="text-sm font-mono text-muted-foreground">
                      {formatDate(announcement.date)}
                    </time>
                    <h2 className="text-xl font-bold mt-1">
                      {announcement.title}
                    </h2>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs whitespace-nowrap ${
                      categoryColors[announcement.category]
                    }`}
                  >
                    {announcement.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  {announcement.description}
                </p>
                <Link
                  href={announcement.link}
                  className="inline-flex items-center text-sm text-[#06D6A0] hover:underline font-medium"
                >
                  Read more →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to stay in the loop?
          </p>
          <Link
            href="#newsletter"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
          >
            Subscribe to Updates
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Newsletter Signup */}
      <section id="newsletter" className="max-w-3xl mx-auto px-4 py-12">
        <NewsletterSignup />
      </section>

    </div>
  );
}
