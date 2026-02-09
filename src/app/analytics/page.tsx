"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import analyticsData from "@/data/analytics.json";
import Link from "next/link";

type TimeRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Get downloads data based on selected time range
  const downloadsData = analyticsData.downloadsOverTime[timeRange];
  const maxDownloads = Math.max(...downloadsData.data);

  // Calculate max value for skill chart scaling
  const maxSkillDownloads = Math.max(
    ...analyticsData.topSkills.map((s) => s.downloads)
  );

  // Category colors for pie-style display
  const categoryColors = [
    "from-cyan to-cyan/80",
    "from-purple to-purple/80",
    "from-green to-green/80",
    "from-yellow to-yellow/80",
    "from-pink to-pink/80",
    "from-blue to-blue/80",
    "from-orange to-orange/80",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-cyan/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            📊 Skill Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights into skill performance, downloads, creators, and trends
          </p>
        </div>
      </section>

      {/* Time Range Selector */}
      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex justify-end gap-2">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === range
                  ? "bg-cyan text-[#0A0E17]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {range === "7d"
                ? "Last 7 days"
                : range === "30d"
                ? "Last 30 days"
                : range === "90d"
                ? "Last 90 days"
                : "All Time"}
            </button>
          ))}
        </div>
      </section>

      {/* Overview Stats Cards */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">📈 Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan">
                {analyticsData.overview.totalSkills.toLocaleString()}
              </CardTitle>
              <CardDescription>Total Skills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Published on platform
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple">
                {analyticsData.overview.totalDownloads.toLocaleString()}
              </CardTitle>
              <CardDescription>Total Downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Across all skills
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green">
                {analyticsData.overview.activeCreators.toLocaleString()}
              </CardTitle>
              <CardDescription>Active Creators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contributing skills
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-yellow">
                {analyticsData.overview.avgRating.toFixed(1)} ⭐
              </CardTitle>
              <CardDescription>Average Rating</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Across all skills
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Downloads Over Time Chart */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">
          📉 Downloads Over Time ({timeRange === "7d" ? "Last 7 Days" : timeRange === "30d" ? "Last 30 Days" : timeRange === "90d" ? "Last 90 Days" : "All Time"})
        </h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              {downloadsData.data.map((value, index) => {
                const percentage = (value / maxDownloads) * 100;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {downloadsData.labels[index]}
                    </span>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan to-purple rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Top 10 Most Downloaded Skills */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🏆 Top 10 Most Downloaded Skills</h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              {analyticsData.topSkills.map((skill, index) => {
                const percentage = (skill.downloads / maxSkillDownloads) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-white/5 text-white/80 border-white/10 w-8 h-8 flex items-center justify-center p-0"
                        >
                          #{index + 1}
                        </Badge>
                        <div>
                          <Link
                            href={`/skills/${skill.slug}`}
                            className="font-semibold text-foreground hover:text-cyan transition-colors"
                          >
                            {skill.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className="bg-cyan/10 text-cyan border-cyan/30 text-xs"
                            >
                              {skill.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {skill.rating} ⭐
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {skill.downloads.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">downloads</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan to-purple rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Category Breakdown and Creator Leaderboard */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <div>
            <h2 className="text-2xl font-bold mb-6">📦 Category Breakdown</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6">
                {/* Pie-style visual */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Skills by Category
                  </p>
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    {analyticsData.categoryBreakdown.map((cat, index) => (
                      <div
                        key={index}
                        className={`bg-gradient-to-r ${categoryColors[index]} flex items-center justify-center text-xs font-semibold text-white transition-all hover:opacity-80`}
                        style={{ width: `${cat.percentage}%` }}
                        title={`${cat.category}: ${cat.percentage}%`}
                      >
                        {cat.percentage > 10 && `${cat.percentage}%`}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category list */}
                <div className="space-y-3">
                  {analyticsData.categoryBreakdown.map((cat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryColors[index]}`}
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            {cat.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cat.count} skills · {cat.downloads.toLocaleString()}{" "}
                            downloads
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-white/5 text-white/80 border-white/10"
                      >
                        {cat.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creator Leaderboard */}
          <div>
            <h2 className="text-2xl font-bold mb-6">👥 Creator Leaderboard</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {analyticsData.topCreators.map((creator, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`${
                            index === 0
                              ? "bg-yellow/20 text-yellow border-yellow/30"
                              : index === 1
                              ? "bg-white/20 text-white border-white/30"
                              : index === 2
                              ? "bg-orange/20 text-orange border-orange/30"
                              : "bg-white/5 text-white/80 border-white/10"
                          } w-8 h-8 flex items-center justify-center p-0`}
                        >
                          {index + 1}
                        </Badge>
                        <div className="text-2xl">{creator.avatar}</div>
                        <div>
                          <Link
                            href={`/creators/${creator.username}`}
                            className="font-semibold text-foreground hover:text-cyan transition-colors"
                          >
                            {creator.displayName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {creator.skillsPublished} skills · {creator.avgRating}{" "}
                            ⭐
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {creator.totalDownloads.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Footer Note */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Analytics data reflects aggregated skill downloads and creator activity. All metrics are updated periodically.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
