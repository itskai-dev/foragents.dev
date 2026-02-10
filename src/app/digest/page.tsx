import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { WeeklyDigestResponse } from "@/lib/weeklyDigest";

export function generateMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://foragents.dev";
  const title = "Weekly Digest — forAgents.dev";
  const description = "A weekly summary of real activity across skills, reviews, trending, and bounties.";
  const ogImage = `${base}/api/og/digest`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/digest`,
      siteName: "forAgents.dev",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="bg-card/50 border-white/5">
      <CardContent className="p-6">
        <div className="text-3xl font-bold">{value.toLocaleString("en-US")}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

async function fetchWeeklyDigest(): Promise<WeeklyDigestResponse | null> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") || "https";

  const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const base = host ? `${protocol}://${host}` : fallbackBase;

  const response = await fetch(`${base}/api/digest`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) return null;

  return (await response.json()) as WeeklyDigestResponse;
}

export default async function DigestPage() {
  const digest = await fetchWeeklyDigest();

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Weekly Digest</h1>
          <p className="text-muted-foreground text-lg">
            Live snapshot of this week&apos;s activity on forAgents.dev.
          </p>
        </div>

        {!digest ? (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-6 text-muted-foreground">
              Unable to load digest data right now.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-8">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">Week in Review</h2>
                    <div className="mt-2 text-sm text-muted-foreground font-mono">
                      {digest.week.label}
                    </div>
                  </div>

                  <Badge variant="outline" className="border-cyan/30 text-cyan bg-cyan/10 w-fit">
                    Weekly
                  </Badge>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="New skills" value={digest.newSkills} />
                  <StatCard label="New reviews" value={digest.newReviews} />
                  <StatCard label="New bounties" value={digest.bounties.new} />
                  <StatCard label="Bounties claimed" value={digest.bounties.claimed} />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Highlights</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {digest.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-cyan" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Top trending skills</h3>
                    {digest.trending.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No trending skills available yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {digest.trending.map((skill) => (
                          <Badge
                            key={skill.slug}
                            variant="outline"
                            className="border-white/10 text-slate-200 hover:bg-white/5"
                            asChild
                          >
                            <Link href={`/skills/${skill.slug}`} className="font-mono">
                              {skill.name}
                            </Link>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 text-sm text-muted-foreground">
                      Looking for more? Browse all{" "}
                      <Link href="/skills" className="text-cyan hover:underline">
                        skills
                      </Link>
                      .
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
