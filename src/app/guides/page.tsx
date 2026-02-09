"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import guidesData from "@/data/guides.json";

interface Guide {
  slug: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  estimatedMinutes: number;
  content: string[];
  tags: string[];
}

const guides: Guide[] = guidesData as Guide[];

const CATEGORIES = [
  { id: "all", name: "All Guides", icon: "📚" },
  { id: "Getting Started", name: "Getting Started", icon: "🚀" },
  { id: "Memory & State", name: "Memory & State", icon: "🧠" },
  { id: "Autonomy", name: "Autonomy", icon: "🤖" },
  { id: "Security", name: "Security", icon: "🔒" },
  { id: "Deployment", name: "Deployment", icon: "🚢" },
  { id: "Integration", name: "Integration", icon: "🔌" },
];

const DIFFICULTY_COLORS = {
  Beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Agent Guides & Tutorials — forAgents.dev",
    description:
      "Comprehensive guides for building, securing, and deploying AI agents. From beginner tutorials to advanced patterns.",
    url: "https://foragents.dev/guides",
    educationalUse:
      "Step-by-step tutorials and guides for AI agent development covering setup, memory, autonomy, security, and deployment",
    about: {
      "@type": "Thing",
      name: "AI Agent Development Guides",
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="relative">
          {/* Subtle aurora background */}
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#06D6A0]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            📖 Agent Guides & Tutorials
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Comprehensive guides for building, securing, and deploying AI agents
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            From your first agent to production multi-agent systems
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#06D6A0]/50 transition-colors"
          />
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedCategory === category.id
                  ? "bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:border-[#06D6A0]/30 hover:text-gray-300"
              }`}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Results Count */}
      {(selectedCategory !== "all" || searchQuery !== "") && (
        <section className="max-w-6xl mx-auto px-4 pb-4">
          <p className="text-sm text-gray-500 text-center">
            {filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"} found
          </p>
        </section>
      )}

      {/* Guides Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {filteredGuides.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No guides found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map((guide) => {
              const category = CATEGORIES.find((c) => c.id === guide.category);

              return (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#06D6A0]/30 hover:bg-white/[0.07] transition-all"
                >
                  {/* Category Icon */}
                  <div className="text-4xl mb-4">{category?.icon}</div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#06D6A0] transition-colors">
                    {guide.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{guide.description}</p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                        DIFFICULTY_COLORS[guide.difficulty]
                      }`}
                    >
                      {guide.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {guide.estimatedMinutes} min
                    </span>
                  </div>

                  {/* Category Label */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-500">{guide.category}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-[#06D6A0]/20 bg-gradient-to-br from-[#06D6A0]/10 to-purple-500/10 p-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Build?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Explore skills, browse the marketplace, or check out community resources
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/skills"
                className="px-6 py-3 bg-[#06D6A0] text-black font-semibold rounded-lg hover:brightness-110 transition-all"
              >
                Browse Skills →
              </Link>
              <Link
                href="/learn"
                className="px-6 py-3 border border-[#06D6A0] text-[#06D6A0] font-semibold rounded-lg hover:bg-[#06D6A0]/10 transition-all"
              >
                Learning Paths
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
