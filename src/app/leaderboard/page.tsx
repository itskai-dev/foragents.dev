import Link from "next/link";

import { getSkills } from "@/lib/data";
import { getTrendingSkillsWithBadges } from "@/lib/server/trendingSkills";
import { SkillTrendingBadge } from "@/components/skill-trending-badge";
import { VerifiedSkillBadge } from "@/components/verified-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InstallCount } from "@/components/InstallCount";

export const revalidate = 300;

export const metadata = {
  title: "Leaderboard — Skills — forAgents.dev",
  description: "Top skills on forAgents.dev, ranked by trending score.",
  openGraph: {
    title: "Leaderboard — Skills — forAgents.dev",
    description: "Top skills on forAgents.dev, ranked by trending score.",
    url: "https://foragents.dev/leaderboard",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard — Skills — forAgents.dev",
    description: "Top skills on forAgents.dev, ranked by trending score.",
  },
};

export default async function LeaderboardPage() {
  const trendingSkills = await getTrendingSkillsWithBadges(getSkills());

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-cyan/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🏆 Skills Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The top skills right now — ranked by installs, recency, and engagement.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Top Skills</h2>
            <p className="text-muted-foreground text-sm mt-1">
              See also <Link href="/trending" className="text-cyan hover:underline">Trending</Link>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.json" className="font-mono text-xs">
                .json
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/skills.md" className="font-mono text-xs">
                .md
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trendingSkills.map((skill, index) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full relative">
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="text-xs font-bold bg-white/5 text-white/80 border-white/10">
                    #{index + 1}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-2 pr-10">
                    <span className="truncate">{skill.name}</span>
                    <VerifiedSkillBadge info={skill.verification ?? null} mode="icon" />
                  </CardTitle>

                  {skill.trendingBadge ? (
                    <div className="mt-2 flex items-center gap-2">
                      <SkillTrendingBadge badge={skill.trendingBadge} />
                    </div>
                  ) : null}

                  <CardDescription className="text-xs flex items-center gap-2">
                    <span>by {skill.author}</span>
                    <span className="text-white/20">•</span>
                    <InstallCount skillSlug={skill.slug} className="text-xs text-cyan" />
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {skill.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {skill.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {skill.tags.length > 2 && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-white/5 text-white/60 border-white/10"
                        >
                          +{skill.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-cyan group-hover:underline">View →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
