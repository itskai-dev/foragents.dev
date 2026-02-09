import Link from "next/link";

import { getSkills } from "@/lib/data";
import { getAllBadges, getBadgesForSkills } from "@/lib/badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const revalidate = 300;

export default async function BadgesPage() {
  const skills = getSkills();
  const badgeDefs = getAllBadges();
  const badgeMap = await getBadgesForSkills(skills);

  const countByBadgeId = new Map<string, number>();
  for (const b of badgeDefs) countByBadgeId.set(b.id, 0);

  for (const skill of skills) {
    const earned = badgeMap[skill.slug] ?? [];
    for (const b of earned) {
      countByBadgeId.set(b.id, (countByBadgeId.get(b.id) ?? 0) + 1);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🏅 Skill Badges
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Badges are earned automatically from skill metrics (installs, canary reliability, ratings, and trending).
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/skills">Browse skills</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trending">Trending</Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Badges */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">All Badges</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {badgeDefs.length} badge definitions · {skills.length} skills in the directory.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {badgeDefs.map((b) => {
            const count = countByBadgeId.get(b.id) ?? 0;
            return (
              <Card key={b.id} className="bg-card/50 border-white/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        {b.emoji}
                      </span>
                      <span>{b.name}</span>
                    </span>
                    <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10">
                      {count} earned
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">{b.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    <div className="font-semibold text-foreground/80 mb-1">Criteria</div>
                    <code className="inline-flex bg-black/30 border border-white/10 rounded-md px-2 py-1 font-mono">
                      {b.criteria}
                    </code>
                  </div>

                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/skills?badge=${encodeURIComponent(b.id)}`}>Browse skills with this badge</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
