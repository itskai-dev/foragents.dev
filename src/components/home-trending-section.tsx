"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillTrendingBadge } from "@/components/skill-trending-badge";
import { SkillVersionBadge } from "@/components/skill-version-badge";
import type { Skill } from "@/lib/data";
import type { TrendingBadgeKind } from "@/lib/trendingTypes";

type TrendingApiSkill = Skill & {
  trendingScore: number;
  installs: number;
  reviews: number;
  avgRating: number | null;
  badge?: TrendingBadgeKind | null;
  trendingBadge?: TrendingBadgeKind | null;
};

export function HomeTrendingSection() {
  const [skills, setSkills] = useState<TrendingApiSkill[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      try {
        const res = await fetch("/api/trending?limit=5");
        const data = (await res.json()) as { skills?: TrendingApiSkill[] };
        if (!cancelled) {
          setSkills(data.skills ?? []);
        }
      } catch {
        if (!cancelled) {
          setSkills([]);
        }
      }
    }

    void loadTrending();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">🔥 Trending This Week</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Hot skills agents are using right now
          </p>
        </div>
        <Link href="/trending" className="text-sm text-cyan hover:underline">
          View all trending →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {skills.map((skill, index) => {
          const badge = skill.badge ?? skill.trendingBadge ?? null;
          return (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="bg-card/50 border-white/5 hover:border-orange-500/20 transition-all group h-full relative">
                {/* Trending badge for top 3 */}
                {index < 3 && (
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold ${
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                          : index === 1
                            ? "bg-gray-400/20 text-gray-300 border-gray-400/30"
                            : "bg-orange-500/20 text-orange-300 border-orange-400/30"
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-orange-500 transition-colors flex items-center gap-2 pr-12">
                    <span className="truncate flex-1">{skill.name}</span>
                    {skill.author === "Team Reflectt" && (
                      <Image
                        src="/badges/verified-skill.svg"
                        alt="Verified Skill"
                        title="Verified: Team Reflectt skill"
                        width={20}
                        height={20}
                        className="w-5 h-5 inline-block"
                      />
                    )}
                    <SkillVersionBadge slug={skill.slug} />
                  </CardTitle>

                  {badge && (
                    <div className="mt-2 flex items-center gap-2">
                      <SkillTrendingBadge badge={badge} />
                    </div>
                  )}

                  <CardDescription className="text-xs flex flex-wrap items-center gap-2">
                    <span>by {skill.author}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-cyan">{skill.installs.toLocaleString()} installs</span>
                    <span className="text-white/20">•</span>
                    <span>{skill.reviews.toLocaleString()} reviews</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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
                    <span className="text-xs text-orange-500 group-hover:underline">
                      View →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
