/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";

import { getSkills } from "@/lib/data";
import { getTrendingSkillsWithBadges } from "@/lib/server/trendingSkills";
import { VerifiedSkillBadge } from "@/components/verified-badge";
import { SkillVersionBadge } from "@/components/skill-version-badge";
import { getAllBadges, getBadgesForSkills } from "@/lib/badges";
import { SkillBadges } from "@/components/skill-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InstallCount } from "@/components/InstallCount";

export const revalidate = 300;

export const metadata = {
  title: "Skills Directory — forAgents.dev",
  description: "Browse skills and kits for AI agents on forAgents.dev.",
  openGraph: {
    title: "Skills Directory — forAgents.dev",
    description: "Browse skills and kits for AI agents on forAgents.dev.",
    url: "https://foragents.dev/skills",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skills Directory — forAgents.dev",
    description: "Browse skills and kits for AI agents on forAgents.dev.",
  },
};

export default async function SkillsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const skills = getSkills();
  const badgeFilter = typeof searchParams?.badge === "string" ? searchParams.badge : "";
  const searchQuery = typeof searchParams?.search === "string" ? searchParams.search.trim().toLowerCase() : "";
  const categoryFilter = typeof searchParams?.category === "string" ? searchParams.category.trim().toLowerCase() : "";
  const sortFilter = typeof searchParams?.sort === "string" ? searchParams.sort.trim().toLowerCase() : "";

  const badgeDefs = getAllBadges();
  const badgeById = new Map(badgeDefs.map((b) => [b.id, b] as const));

  const badgeMap = await getBadgesForSkills(skills);

  let filteredSkills = badgeFilter
    ? skills.filter((s) => (badgeMap[s.slug] ?? []).some((b) => b.id === badgeFilter))
    : skills;

  if (categoryFilter) {
    filteredSkills = filteredSkills.filter((skill) =>
      skill.tags.some((tag) => tag.toLowerCase() === categoryFilter)
    );
  }

  if (searchQuery) {
    filteredSkills = filteredSkills.filter((skill) => {
      const haystack = `${skill.name} ${skill.description}`.toLowerCase();
      return haystack.includes(searchQuery);
    });
  }

  if (sortFilter === "trending") {
    filteredSkills = await getTrendingSkillsWithBadges(filteredSkills);
  }

  const activeBadge = badgeFilter ? badgeById.get(badgeFilter) : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🧰 Skills Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse {filteredSkills.length} skills for AI agents
            {activeBadge ? (
              <> — filtered by <span className="text-foreground">{activeBadge.emoji} {activeBadge.name}</span></>
            ) : null}
            {searchQuery ? (
              <> matching <span className="text-foreground">"{searchQuery}"</span></>
            ) : null}
            .
          </p>

          {activeBadge || searchQuery || categoryFilter || sortFilter ? (
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/skills">Clear filter</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* List */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">All Skills</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Looking for filters? Try{" "}
              <Link href="/badges" className="text-cyan hover:underline">Badges</Link>
              {" "}or{" "}
              <Link href="/search" className="text-cyan hover:underline">Search</Link>.
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
          {filteredSkills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-2">
                    <span className="truncate flex-1">{skill.name}</span>
                    <VerifiedSkillBadge info={skill.verification ?? null} mode="icon" />
                    <SkillVersionBadge slug={skill.slug} />
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-2">
                    <span>by {skill.author}</span>
                    <span className="text-white/20">•</span>
                    <InstallCount skillSlug={skill.slug} className="text-xs text-cyan" />
                  </CardDescription>
                  <SkillBadges
                    badges={badgeMap[skill.slug] ?? []}
                    mode="compact"
                    className="mt-2"
                  />
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
