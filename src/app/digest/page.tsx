import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import weeklyDigestsData from "../../../data/weekly-digests.json";

type WeeklyDigest = {
  id: string;
  weekNumber?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  title: string;
  highlights: string[];
  stats: {
    prsShipped: number;
    newPages: number;
    newFeatures: number;
  };
  topSkills: string[];
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // If dates are invalid, fall back to raw strings.
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} – ${endDate}`;
  }

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  // Feb 3–8, 2026
  if (sameMonth) {
    const month = start.toLocaleDateString("en-US", { month: "short" });
    return `${month} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }

  // Jan 30 – Feb 2, 2026
  if (sameYear) {
    const startFmt = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFmt = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startFmt} – ${endFmt}`;
  }

  // Dec 30, 2025 – Jan 5, 2026
  const startFmt = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endFmt = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}

function getDigests(): WeeklyDigest[] {
  const raw = Array.isArray(weeklyDigestsData) ? (weeklyDigestsData as WeeklyDigest[]) : [];

  return raw
    .filter((d) => !!d && typeof d === "object")
    .filter((d) => typeof d.id === "string" && typeof d.title === "string")
    .slice()
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
}

export function generateMetadata(): Metadata {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://foragents.dev";

  const digests = getDigests();
  const latest = digests[0];

  const title = "Weekly Digest — forAgents.dev";

  const description = latest
    ? `${latest.title} (${formatDateRange(latest.startDate, latest.endDate)}).`
    : "A weekly summary of what's shipped on forAgents.dev.";

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

export default function DigestPage() {
  const digests = getDigests();
  const latest = digests[0] ?? null;
  const archive = latest ? digests.slice(1) : digests;

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Weekly Digest</h1>
          <p className="text-muted-foreground text-lg">
            A weekly summary of what shipped on forAgents.dev.
          </p>
        </div>

        {!latest ? (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-6 text-muted-foreground">
              No digests published yet.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-8">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">{latest.title}</h2>
                    <div className="mt-2 text-sm text-muted-foreground font-mono">
                      {formatDateRange(latest.startDate, latest.endDate)}
                    </div>
                  </div>

                  {typeof latest.weekNumber === "number" ? (
                    <Badge variant="outline" className="border-cyan/30 text-cyan bg-cyan/10 w-fit">
                      Week {latest.weekNumber}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="PRs shipped" value={latest.stats.prsShipped} />
                  <StatCard label="New pages" value={latest.stats.newPages} />
                  <StatCard label="New features" value={latest.stats.newFeatures} />
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Highlights</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {latest.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-cyan" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Top skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {latest.topSkills.map((slug) => (
                        <Badge
                          key={slug}
                          variant="outline"
                          className="border-white/10 text-slate-200 hover:bg-white/5"
                          asChild
                        >
                          <Link href={`/skills/${slug}`} className="font-mono">
                            {slug}
                          </Link>
                        </Badge>
                      ))}
                    </div>

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

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12" id="archive">
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Archive</h2>
          <div className="text-sm text-muted-foreground">
            {digests.length} {digests.length === 1 ? "digest" : "digests"}
          </div>
        </div>

        {archive.length === 0 ? (
          <Card className="bg-card/50 border-white/5">
            <CardContent className="p-6 text-muted-foreground">
              No older digests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archive.map((d) => (
              <Card
                key={d.id}
                className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {formatDateRange(d.startDate, d.endDate)}
                      </div>
                      <div className="mt-2 font-semibold">{d.title}</div>
                    </div>
                    {typeof d.weekNumber === "number" ? (
                      <Badge variant="outline" className="border-white/10 text-muted-foreground">
                        Week {d.weekNumber}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="font-semibold">{d.stats.prsShipped}</div>
                      <div className="text-muted-foreground">PRs</div>
                    </div>
                    <div>
                      <div className="font-semibold">{d.stats.newPages}</div>
                      <div className="text-muted-foreground">Pages</div>
                    </div>
                    <div>
                      <div className="font-semibold">{d.stats.newFeatures}</div>
                      <div className="text-muted-foreground">Features</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
