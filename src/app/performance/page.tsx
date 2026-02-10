/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import Link from "next/link";
import performanceData from "@/data/performance.json";
import { PerformanceBenchmarksPanel } from "@/components/performance/performance-benchmarks-panel";

interface PerformanceArea {
  slug: string;
  title: string;
  description: string;
  category: string;
  impact: "Low" | "Medium" | "High" | "Critical";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  icon: string;
  tags: string[];
  metrics: {
    potentialSavings: string;
    responseSpeedUp: string;
    implementationTime: string;
  };
}

const areas: PerformanceArea[] = performanceData as PerformanceArea[];

const IMPACT_COLORS = {
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  High: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const DIFFICULTY_COLORS = {
  Beginner: "bg-emerald-500/10 text-emerald-400",
  Intermediate: "bg-amber-500/10 text-amber-400",
  Advanced: "bg-rose-500/10 text-rose-400",
};

export default function PerformanceHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(areas.map((a) => a.category))),
  ];

  const filteredAreas = selectedCategory === "all"
    ? areas
    : areas.filter((a) => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <span>⚡</span>
              <span>Performance Optimization</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 text-transparent bg-clip-text">
              Build Faster, Cheaper Agents
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Practical strategies to optimize token usage, reduce latency, and scale your agents to production. 
              Real-world patterns with measurable impact.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Avg Cost Savings", value: "40-70%", icon: "💰" },
            { label: "Latency Reduction", value: "5-10x", icon: "⚡" },
            { label: "Production Ready", value: "3 Days", icon: "🚀" },
            { label: "Areas Covered", value: "5", icon: "📊" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-colors"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300 border border-white/10"
              }`}
            >
              {cat === "all" ? "All Areas" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Areas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAreas.map((area) => (
            <Link
              key={area.slug}
              href={`/performance/${area.slug}`}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/[0.07] hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{area.icon}</div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      IMPACT_COLORS[area.impact]
                    }`}
                  >
                    {area.impact} Impact
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      DIFFICULTY_COLORS[area.difficulty]
                    }`}
                  >
                    {area.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {area.title}
              </h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {area.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Savings</div>
                  <div className="text-sm font-semibold text-emerald-400">
                    {area.metrics.potentialSavings}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Speed</div>
                  <div className="text-sm font-semibold text-blue-400">
                    {area.metrics.responseSpeedUp}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Time</div>
                  <div className="text-sm font-semibold text-purple-400">
                    {area.metrics.implementationTime}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {area.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-white/5 text-slate-400 rounded border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Read Guide</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PerformanceBenchmarksPanel
          title="Performance Overview"
          description="Cross-category benchmark data loaded from the persistent performance dataset."
        />
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to optimize your agents?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Start with token optimization for quick wins, then layer in caching and scaling strategies as you grow.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/performance/tokens"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/25"
            >
              Start with Tokens →
            </Link>
            <Link
              href="/guides"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors border border-white/10"
            >
              Browse All Guides
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
