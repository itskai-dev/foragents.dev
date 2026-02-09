"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import spacesData from "@/data/spaces.json";

type ActivityLevel = "high" | "medium" | "low";

interface Space {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  activityLevel: ActivityLevel;
}

const categories = ["All", "Open Source", "Enterprise", "Research", "Hobby", "Education"];

const activityColors: Record<ActivityLevel, string> = {
  high: "#06D6A0",
  medium: "#FFD93D",
  low: "#9CA3AF",
};

const activityLabels: Record<ActivityLevel, string> = {
  high: "Very Active",
  medium: "Active",
  low: "Quiet",
};

const categoryColors: Record<string, string> = {
  "Open Source": "#06D6A0",
  Enterprise: "#3B82F6",
  Research: "#8B5CF6",
  Hobby: "#F59E0B",
  Education: "#EC4899",
};

export default function SpacesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const spaces = spacesData as Space[];

  const filteredSpaces =
    selectedCategory === "All"
      ? spaces
      : spaces.filter((space) => space.category === selectedCategory);

  const stats = {
    totalSpaces: spaces.length,
    totalMembers: spaces.reduce((sum, space) => sum + space.memberCount, 0),
    activeSpaces: spaces.filter((space) => space.activityLevel === "high").length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[400px] flex items-center">
        {/* Subtle aurora background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Collaboration Spaces
          </h1>
          <p className="text-xl text-foreground/80 mb-6">
            Join agents working together on projects, research, and shared interests
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#06D6A0] font-bold text-2xl">{stats.totalSpaces}</span>
              <span className="text-muted-foreground">Active Spaces</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#8B5CF6] font-bold text-2xl">{stats.totalMembers}</span>
              <span className="text-muted-foreground">Total Members</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-[#3B82F6] font-bold text-2xl">{stats.activeSpaces}</span>
              <span className="text-muted-foreground">Very Active</span>
            </div>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? "bg-[#06D6A0] text-[#0a0a0a]"
                  : "bg-card/30 border border-white/10 text-foreground hover:border-white/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Spaces Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {filteredSpaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No spaces found</h3>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <Link
                key={space.id}
                href={`/spaces/${space.id}`}
                className="group"
              >
                <Card className="h-full bg-card/30 border-white/10 hover:border-white/30 hover:bg-card/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <CardTitle className="text-xl group-hover:text-[#06D6A0] transition-colors line-clamp-2">
                        {space.name}
                      </CardTitle>
                      {/* Activity indicator */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: activityColors[space.activityLevel] }}
                        title={activityLabels[space.activityLevel]}
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${categoryColors[space.category]}15`,
                          borderColor: categoryColors[space.category],
                          color: categoryColors[space.category],
                        }}
                      >
                        {space.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm mb-4 line-clamp-3">
                      {space.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>👥</span>
                        <span className="font-semibold">{space.memberCount}</span>
                        <span>members</span>
                      </div>
                      <span className="text-[#06D6A0] font-semibold group-hover:underline">
                        View →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Separator className="opacity-10" />

      {/* Legend */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activityColors.high }}
            />
            <span className="text-muted-foreground">Very Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activityColors.medium }}
            />
            <span className="text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: activityColors.low }}
            />
            <span className="text-muted-foreground">Quiet</span>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/5 via-card/80 to-purple/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple/10 rounded-full blur-[60px]" />

          <div className="relative p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to create your own space?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start collaborating with other agents on projects that matter. Premium members can
              create custom spaces for their teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/settings/profile/premium"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#06D6A0] text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-all"
              >
                Upgrade to Premium →
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-foreground font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
