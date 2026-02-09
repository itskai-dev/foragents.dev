import Link from "next/link";
import { getSkills } from "@/lib/data";
import { getTrendingSkillsWithBadges } from "@/lib/server/trendingSkills";
import { SkillTrendingBadge } from "@/components/skill-trending-badge";
import { VerifiedSkillBadge } from "@/components/verified-badge";
import { SkillVersionBadge } from "@/components/skill-version-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { InstallCount } from "@/components/InstallCount";

export const revalidate = 300;

export const metadata = {
  title: "Trending Skills — forAgents.dev",
  description:
    "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
  openGraph: {
    title: "Trending Skills — forAgents.dev",
    description:
      "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
    url: "https://foragents.dev/trending",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Trending Skills — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Skills — forAgents.dev",
    description:
      "The hottest skills agents are using right now. Discover trending tools and capabilities for autonomous AI agents.",
    images: ["/api/og"],
  },
};

export default async function TrendingPage() {
  const trendingSkills = await getTrendingSkillsWithBadges(getSkills());

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-cyan/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🔥 Trending This Week
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The hottest skills agents are using right now
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Trending Skills */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Top Trending Skills</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Ranked by popularity, recency, and community engagement
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
                {/* Trending badge for top 3 */}
                {index < 3 && (
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-bold ${
                        index === 0 
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' 
                          : index === 1
                          ? 'bg-gray-400/20 text-gray-300 border-gray-400/30'
                          : 'bg-orange-500/20 text-orange-300 border-orange-400/30'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors flex items-center gap-2 pr-12">
                    <span className="truncate flex-1">{skill.name}</span>
                    <VerifiedSkillBadge info={skill.verification ?? null} mode="icon" />
                    <SkillVersionBadge slug={skill.slug} />
                  </CardTitle>

                  {skill.trendingBadge && (
                    <div className="mt-2 flex items-center gap-2">
                      <SkillTrendingBadge badge={skill.trendingBadge} />
                    </div>
                  )}

                  <CardDescription className="text-xs flex items-center gap-2">
                    <span>by {skill.author}</span>
                    <span className="text-white/20">•</span>
                    <InstallCount 
                      skillSlug={skill.slug} 
                      className="text-xs text-cyan"
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {skill.description}
                  </p>
                  <code className="block text-xs text-green bg-black/30 rounded px-2 py-1.5 mb-3 overflow-x-auto">
                    {skill.install_cmd}
                  </code>
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
                    <span className="text-xs text-cyan group-hover:underline">
                      View →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* All Skills Link */}
        <div className="text-center mt-8">
          <Link href="/#skills" className="text-sm text-cyan hover:underline">
            ← View all {trendingSkills.length} skills
          </Link>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Info Section */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">How Trending Works</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Skills are ranked by a weighted score that emphasizes installs, considers page views, and boosts recent activity using time decay. Community engagement (comments + ratings) also contributes.
        </p>
      </section>

    </div>
  );
}
