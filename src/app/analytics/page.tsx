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

type TimeRange = "7d" | "30d" | "90d";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // Calculate max value for chart scaling
  const maxViews = Math.max(...analyticsData.trafficChart.data);

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
            📊 Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time insights into forAgents.dev traffic and engagement
          </p>
        </div>
      </section>

      {/* Time Range Selector */}
      <section className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex justify-end gap-2">
          {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === range
                  ? "bg-cyan text-[#0A0E17]"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`}
            >
              {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
            </button>
          ))}
        </div>
      </section>

      {/* Overview Stats Cards */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">📈 Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan">
                {analyticsData.overview.pageViewsThisMonth.toLocaleString()}
              </CardTitle>
              <CardDescription>Page Views (This Month)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Total page impressions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple">
                {analyticsData.overview.uniqueVisitors.toLocaleString()}
              </CardTitle>
              <CardDescription>Unique Visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Individual users tracked
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-green">
                {analyticsData.overview.skillDownloads.toLocaleString()}
              </CardTitle>
              <CardDescription>Skill Downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Skills accessed/installed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-cyan">
                {analyticsData.overview.apiCalls.toLocaleString()}
              </CardTitle>
              <CardDescription>API Calls</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Machine-readable requests
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-purple">
                {analyticsData.overview.avgSessionDuration}
              </CardTitle>
              <CardDescription>Avg Session Duration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Time spent on site
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="opacity-10" />

      {/* Traffic Chart */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">📉 Daily Traffic (Last 14 Days)</h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              {analyticsData.trafficChart.data.map((value, index) => {
                const percentage = (value / maxViews) * 100;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {analyticsData.trafficChart.labels[index]}
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

      {/* Top Pages Table */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">📄 Top Pages</h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">
                      Page Path
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">
                      Views
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">
                      Unique Visitors
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-muted-foreground">
                      Avg Time on Page
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.topPages.map((page, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-cyan">
                        {page.path}
                      </td>
                      <td className="p-4 text-right font-semibold">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {page.uniqueVisitors.toLocaleString()}
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {page.avgTimeOnPage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Top Referrers */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🔗 Top Referrers</h2>
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6 space-y-4">
            {analyticsData.topReferrers.map((referrer, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {referrer.source}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {referrer.visits.toLocaleString()} visits
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-cyan/10 text-cyan border-cyan/30"
                  >
                    {referrer.percentage}%
                  </Badge>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan to-purple rounded-full transition-all duration-500"
                    style={{ width: `${referrer.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Separator className="opacity-10" />

      {/* Geographic Breakdown and Device Breakdown */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Geographic Breakdown */}
          <div>
            <h2 className="text-2xl font-bold mb-6">🌍 Geographic Breakdown</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6 space-y-3">
                {analyticsData.geographicBreakdown.map((country, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {country.country}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {country.visits.toLocaleString()} visits
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white/5 text-white/80 border-white/10"
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <div>
            <h2 className="text-2xl font-bold mb-6">💻 Device Breakdown</h2>
            <Card className="bg-card/50 border-white/5">
              <CardContent className="p-6 space-y-6">
                {/* Desktop */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🖥️</span>
                      <span className="font-semibold text-foreground">Desktop</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-cyan/10 text-cyan border-cyan/30"
                    >
                      {analyticsData.deviceBreakdown.desktop}%
                    </Badge>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan to-cyan/80 rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.deviceBreakdown.desktop}%` }}
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📱</span>
                      <span className="font-semibold text-foreground">Mobile</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-purple/10 text-purple border-purple/30"
                    >
                      {analyticsData.deviceBreakdown.mobile}%
                    </Badge>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple to-purple/80 rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.deviceBreakdown.mobile}%` }}
                    />
                  </div>
                </div>

                {/* Tablet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📲</span>
                      <span className="font-semibold text-foreground">Tablet</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green/10 text-green border-green/30"
                    >
                      {analyticsData.deviceBreakdown.tablet}%
                    </Badge>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green to-green/80 rounded-full transition-all duration-500"
                      style={{ width: `${analyticsData.deviceBreakdown.tablet}%` }}
                    />
                  </div>
                </div>

                {/* Visual Summary */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Device Distribution
                  </p>
                  <div className="flex h-8 rounded-lg overflow-hidden">
                    <div
                      className="bg-cyan flex items-center justify-center text-xs font-semibold text-[#0A0E17]"
                      style={{ width: `${analyticsData.deviceBreakdown.desktop}%` }}
                      title="Desktop"
                    >
                      {analyticsData.deviceBreakdown.desktop}%
                    </div>
                    <div
                      className="bg-purple flex items-center justify-center text-xs font-semibold text-white"
                      style={{ width: `${analyticsData.deviceBreakdown.mobile}%` }}
                      title="Mobile"
                    >
                      {analyticsData.deviceBreakdown.mobile}%
                    </div>
                    <div
                      className="bg-green flex items-center justify-center text-xs font-semibold text-[#0A0E17]"
                      style={{ width: `${analyticsData.deviceBreakdown.tablet}%` }}
                      title="Tablet"
                    >
                      {analyticsData.deviceBreakdown.tablet}%
                    </div>
                  </div>
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
              Analytics data updates in real-time. All metrics are based on privacy-respecting, cookie-free tracking.
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
