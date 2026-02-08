import type { Metadata } from "next";
import Link from "next/link";
// import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Separator } from "@/components/ui/separator";
import { type ChangelogCategory, type ChangelogEntry } from "@/lib/changelog";
import changelogData from "../../../data/changelog.json";

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
  if (category === "improvement") return "Improvement";
  return "Fix";
}

const categoryColors: Record<ChangelogCategory, string> = {
  feature: "bg-cyan/10 text-cyan border-cyan/30",
  improvement: "bg-purple/10 text-purple border-purple/30",
  fix: "bg-green/10 text-green border-green/30",
};

type DateGroup = { date: string; entries: ChangelogEntry[] };

function groupByDate(entries: ChangelogEntry[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.date) {
      last.entries.push(entry);
    } else {
      groups.push({ date: entry.date, entries: [entry] });
    }
  }
  return groups;
}

export function generateMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://foragents.dev";

  const title = "Changelog — forAgents.dev";
  const description = "Recent updates and improvements to forAgents.dev.";
  const ogImage = `${base}/api/og/changelog`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/changelog`,
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function ChangelogPage() {
  const entries = (Array.isArray(changelogData) ? (changelogData as ChangelogEntry[]) : [])
    .filter((e) => !!e && typeof e === "object")
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groups = groupByDate(entries);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Changelog</h1>
          <p className="text-muted-foreground text-lg">
            Recent updates and improvements to forAgents.dev.
          </p>
          <div className="mt-3 text-sm text-muted-foreground">
            <Link href="/api/changelog" className="hover:underline font-mono">
              /api/changelog
            </Link>
          </div>
        </div>

        {/* Timeline */}
        {entries.length === 0 ? (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-6 text-muted-foreground">
              No updates published yet.
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-px bg-white/10" />

            <div className="space-y-12">
              {groups.map((group) => (
                <div key={group.date} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan" />
                  </div>

                  <div className="mb-4">
                    <h2 className="text-sm font-mono text-muted-foreground">
                      {formatDate(group.date)}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {group.entries.map((entry, idx) => (
                      <Card
                        key={`${entry.date}-${idx}-${entry.title}`}
                        className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <h3 className="text-lg font-bold">{entry.title}</h3>
                            <Badge
                              variant="outline"
                              className={`text-xs whitespace-nowrap ${
                                categoryColors[entry.category]
                              }`}
                            >
                              {labelCategory(entry.category)}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground mb-4">
                            {entry.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <Link
                              href={entry.link}
                              className="inline-flex items-center text-sm text-cyan hover:underline font-medium"
                            >
                              View →
                            </Link>

                            {entry.pr ? (
                              <Link
                                href={entry.pr}
                                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:underline font-medium"
                                target="_blank"
                                rel="noreferrer"
                              >
                                PR
                              </Link>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
