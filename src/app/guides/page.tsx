/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";
type CategoryFilter =
  | "all"
  | "getting-started"
  | "best-practices"
  | "deployment"
  | "security"
  | "performance";

type GuideSummary = {
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "getting-started" | "best-practices" | "deployment" | "security" | "performance";
  readCount: number;
  estimatedMinutes: number;
  author: string;
};

const DIFFICULTY_OPTIONS: Array<{ id: DifficultyFilter; label: string }> = [
  { id: "all", label: "All Levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const CATEGORY_OPTIONS: Array<{ id: CategoryFilter; label: string; icon: string }> = [
  { id: "all", label: "All Categories", icon: "📚" },
  { id: "getting-started", label: "Getting Started", icon: "🚀" },
  { id: "best-practices", label: "Best Practices", icon: "✅" },
  { id: "deployment", label: "Deployment", icon: "🚢" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "performance", label: "Performance", icon: "⚡" },
];

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideSummary[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedDifficulty !== "all") {
      params.set("difficulty", selectedDifficulty);
    }

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    const normalizedSearch = searchQuery.trim();
    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    return params.toString();
  }, [selectedDifficulty, selectedCategory, searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGuides() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/guides${query ? `?${query}` : ""}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load guides");
        }

        const payload = (await response.json()) as { guides: GuideSummary[] };
        setGuides(payload.guides ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Couldn't load guides right now. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadGuides();

    return () => controller.abort();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">📖 Agent Guides</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Real-world guides for building, securing, and deploying AI agents
        </p>
        <p className="text-sm text-gray-500 mt-2">It's all designed for practical shipping.</p>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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

      <section className="max-w-6xl mx-auto px-4 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {DIFFICULTY_OPTIONS.map((difficulty) => (
            <button
              key={difficulty.id}
              onClick={() => setSelectedDifficulty(difficulty.id)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedDifficulty === difficulty.id
                  ? "bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:border-[#06D6A0]/30 hover:text-gray-300"
              }`}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORY_OPTIONS.map((category) => (
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
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading guides…</div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-rose-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#06D6A0] text-black rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No guides match your filters.</div>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center mb-6">{guides.length} guides found</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => {
                const category = CATEGORY_OPTIONS.find((option) => option.id === guide.category);

                return (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="group bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#06D6A0]/30 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="text-4xl mb-4">{category?.icon ?? "📘"}</div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#06D6A0] transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">{guide.description}</p>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                          DIFFICULTY_COLORS[guide.difficulty]
                        }`}
                      >
                        {toTitleCase(guide.difficulty)}
                      </span>
                      <span className="text-xs text-gray-500">⏱ {guide.estimatedMinutes} min</span>
                      <span className="text-xs text-gray-500">👀 {guide.readCount} reads</span>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                      <span>{toTitleCase(guide.category)}</span>
                      <span>By {guide.author}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
