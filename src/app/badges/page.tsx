"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
type BadgeData = {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: string;
  unlocked: boolean;
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeData[]>([
    {
      id: "early-adopter",
      name: "Early Adopter",
      icon: "🚀",
      description: "You were here when it all began",
      criteria: "Join forAgents.dev during beta phase",
      unlocked: false,
    },
    {
      id: "first-install",
      name: "First Install",
      icon: "⚡",
      description: "Installed your first skill",
      criteria: "Successfully install any skill",
      unlocked: false,
    },
    {
      id: "power-user",
      name: "Power User",
      icon: "💪",
      description: "You&apos;re a skill collection master",
      criteria: "Install 10 or more skills",
      unlocked: false,
    },
    {
      id: "contributor",
      name: "Contributor",
      icon: "🤝",
      description: "You&apos;ve given back to the community",
      criteria: "Submit a skill to forAgents.dev",
      unlocked: false,
    },
    {
      id: "bug-hunter",
      name: "Bug Hunter",
      icon: "🐛",
      description: "Helping make things better",
      criteria: "Report a verified bug or issue",
      unlocked: false,
    },
    {
      id: "documentation-hero",
      name: "Documentation Hero",
      icon: "📚",
      description: "Knowledge is power, and you&apos;re sharing it",
      criteria: "Contribute to documentation or write a guide",
      unlocked: false,
    },
    {
      id: "community-builder",
      name: "Community Builder",
      icon: "🌟",
      description: "You bring people together",
      criteria: "Help 5+ community members or share skills publicly",
      unlocked: false,
    },
    {
      id: "skill-creator",
      name: "Skill Creator",
      icon: "🛠️",
      description: "You&apos;ve built something amazing",
      criteria: "Create and publish an original skill",
      unlocked: false,
    },
    {
      id: "beta-tester",
      name: "Beta Tester",
      icon: "🧪",
      description: "Testing the bleeding edge",
      criteria: "Test new features before public release",
      unlocked: false,
    },
    {
      id: "open-source-champion",
      name: "Open Source Champion",
      icon: "🏆",
      description: "You&apos;re a true advocate for open source",
      criteria: "Make multiple contributions to open source agent projects",
      unlocked: false,
    },
  ]);

  const [earnedCount, setEarnedCount] = useState(0);

  const unlockBadge = (badgeId: string) => {
    try {
      const savedProgress = localStorage.getItem("foragents-badges");
      const unlockedBadges: string[] = savedProgress
        ? JSON.parse(savedProgress)
        : [];

      if (!unlockedBadges.includes(badgeId)) {
        unlockedBadges.push(badgeId);
        localStorage.setItem(
          "foragents-badges",
          JSON.stringify(unlockedBadges)
        );

        setBadges((prev) =>
          prev.map((badge) =>
            badge.id === badgeId ? { ...badge, unlocked: true } : badge
          )
        );
        setEarnedCount(unlockedBadges.length);
      }
    } catch (error) {
      console.error("Failed to unlock badge:", error);
    }
  };

  const loadBadgeProgress = () => {
    try {
      const savedProgress = localStorage.getItem("foragents-badges");
      if (savedProgress) {
        const unlockedBadges: string[] = JSON.parse(savedProgress);
        setBadges((prev) =>
          prev.map((badge) => ({
            ...badge,
            unlocked: unlockedBadges.includes(badge.id),
          }))
        );
        setEarnedCount(unlockedBadges.length);
      }

      // Auto-unlock First Install if user has bookmarks (simple heuristic)
      const bookmarks = localStorage.getItem("foragents-bookmarks");
      if (bookmarks) {
        const bookmarkData = JSON.parse(bookmarks);
        if (Object.keys(bookmarkData).length > 0) {
          unlockBadge("first-install");
        }
        if (Object.keys(bookmarkData).length >= 10) {
          unlockBadge("power-user");
        }
      }
    } catch (error) {
      console.error("Failed to load badge progress:", error);
    }
  };

  useEffect(() => {
    // Load badge progress from localStorage
    loadBadgeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPercentage = Math.round((earnedCount / badges.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#06D6A0]/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple/3 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#F8FAFC] mb-4">
            🏅 Badges &amp; Achievements
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your journey and unlock achievements as you explore the agent
            ecosystem
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Progress Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <Card className="bg-card/50 border-white/5 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Your Progress</CardTitle>
            <CardDescription>
              {earnedCount} of {badges.length} badges earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="relative">
              <div className="h-6 bg-black/30 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#06D6A0] to-[#06D6A0]/70 transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage > 10 && (
                    <span className="text-xs font-bold text-[#0a0a0a]">
                      {progressPercentage}%
                    </span>
                  )}
                </div>
              </div>
              {progressPercentage <= 10 && progressPercentage > 0 && (
                <span className="absolute right-0 top-0 text-xs font-bold text-[#06D6A0] -translate-y-6">
                  {progressPercentage}%
                </span>
              )}
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#06D6A0]">
                  {earnedCount}
                </div>
                <div className="text-xs text-muted-foreground">Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white/40">
                  {badges.length - earnedCount}
                </div>
                <div className="text-xs text-muted-foreground">Locked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#06D6A0]">
                  {progressPercentage}%
                </div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">All Badges</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <Card
                key={badge.id}
                className={`${
                  badge.unlocked
                    ? "bg-card/50 border-[#06D6A0]/30"
                    : "bg-card/20 border-white/5 opacity-60"
                } transition-all hover:scale-105`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={`text-5xl ${
                        badge.unlocked ? "" : "grayscale opacity-40"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {badge.name}
                        {badge.unlocked && (
                          <Badge className="bg-[#06D6A0] text-[#0a0a0a] text-xs px-2 py-0">
                            ✓
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {badge.unlocked ? "Unlocked!" : "Locked"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.description}
                  </p>
                  <div className="flex items-start gap-2 p-3 bg-black/30 rounded-lg border border-white/5">
                    <span className="text-xs text-white/40 shrink-0 mt-0.5">
                      🎯
                    </span>
                    <p className="text-xs text-white/60 leading-relaxed">
                      {badge.criteria}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {earnedCount === 0 && (
          <Card className="bg-gradient-to-r from-[#06D6A0]/10 to-purple/10 border-[#06D6A0]/20 text-center">
            <CardContent className="py-12">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-2">
                Start Your Journey!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Explore skills, contribute to the community, and unlock badges
                along the way
              </p>
              <Link
                href="/#skills"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Browse Skills →
              </Link>
            </CardContent>
          </Card>
        )}

        {earnedCount === badges.length && (
          <Card className="bg-gradient-to-r from-[#06D6A0]/10 to-purple/10 border-[#06D6A0]/20 text-center">
            <CardContent className="py-12">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">
                Achievement Master!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You&apos;ve unlocked all badges! You&apos;re a true champion of
                the agent ecosystem.
              </p>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Share Your Skills →
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

    </div>
  );
}
