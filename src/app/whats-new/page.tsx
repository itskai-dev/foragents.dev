import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Separator } from "@/components/ui/separator";
import changelogData from "../../../data/changelog.json";
import { type ChangelogCategory, type ChangelogEntry } from "@/lib/changelog";

export const metadata = {
  title: "What&apos;s New — forAgents.dev",
  description: "A chronological changelog of platform updates on forAgents.dev.",
  openGraph: {
    title: "What&apos;s New — forAgents.dev",
    description: "A chronological changelog of platform updates on forAgents.dev.",
    url: "https://foragents.dev/whats-new",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What&apos;s New — forAgents.dev",
    description: "A chronological changelog of platform updates on forAgents.dev.",
  },
};

const categoryColors: Record<ChangelogCategory, string> = {
  feature: "bg-cyan/10 text-cyan border-cyan/30",
  bugfix: "bg-green/10 text-green border-green/30",
  docs: "bg-blue/10 text-blue border-blue/30",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function labelCategory(category: ChangelogCategory): string {
  if (category === "feature") return "Feature";
  if (category === "bugfix") return "Bugfix";
  if (category === "docs") return "Docs";
  return "Feature";
}

export default function WhatsNewPage() {
  const entries = (changelogData as ChangelogEntry[])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">What&apos;s New</h1>
          <p className="text-muted-foreground text-lg">
            A chronological changelog of platform updates.
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <Link href="/api/changelog" className="hover:underline font-mono">
              /api/changelog
            </Link>
          </div>
        </div>

        {/* Changelog Feed */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6 text-muted-foreground">
                No updates published yet.
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card
                key={entry.id}
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
                    <Badge
                      variant="outline"
                      className={`text-xs whitespace-nowrap ${categoryColors[entry.category]}`}
                    >
                      {labelCategory(entry.category)}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-4">{entry.description}</p>

                  <Link
                    href={entry.prUrl}
                    className="inline-flex items-center text-sm text-cyan hover:underline font-medium"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View PR #{entry.prNumber} →
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want updates in your inbox?
          </p>
          <Link
            href="#newsletter"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
          >
            Subscribe
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
