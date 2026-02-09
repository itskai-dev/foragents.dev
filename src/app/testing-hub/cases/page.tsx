"use client";

import { useState, useMemo } from "react";
import testCasesData from "@/data/test-cases.json";

interface TestCase {
  id: string;
  category: string;
  title: string;
  description: string;
  difficulty: string;
  setup: string;
  input: string;
  expectedBehavior: string;
  commonFailures: string[];
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const testCases = testCasesData.testCases as TestCase[];
const categories = testCasesData.categories as Category[];

const DIFFICULTY_COLORS = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const CATEGORY_COLORS: Record<string, string> = {
  "tool-reliability": "border-l-blue-500",
  "context-handling": "border-l-purple-500",
  "error-recovery": "border-l-red-500",
  "multi-turn": "border-l-green-500",
  "edge-cases": "border-l-yellow-500",
};

export default function TestCasesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const filteredCases = useMemo(() => {
    return testCases.filter((testCase) => {
      const matchesCategory = selectedCategory === "all" || testCase.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || testCase.difficulty === selectedDifficulty;
      const matchesSearch =
        searchQuery === "" ||
        testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: testCases.length,
      beginner: testCases.filter((tc) => tc.difficulty === "beginner").length,
      intermediate: testCases.filter((tc) => tc.difficulty === "intermediate").length,
      advanced: testCases.filter((tc) => tc.difficulty === "advanced").length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mb-8">
            <a
              href="/testing-hub"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              ← Back to Testing Hub
            </a>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Test Case Library</h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Pre-built test cases for agent development. Each includes setup instructions, expected behavior, and common
            failure patterns.
          </p>
          <div className="mt-8 flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-white/60">Total Cases</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.beginner}</div>
              <div className="text-sm text-white/60">Beginner</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.intermediate}</div>
              <div className="text-sm text-white/60">Intermediate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{stats.advanced}</div>
              <div className="text-sm text-white/60">Advanced</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
          />

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Difficulty</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDifficulty("all")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDifficulty === "all"
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedDifficulty("beginner")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDifficulty === "beginner"
                      ? "bg-green-500 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setSelectedDifficulty("intermediate")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDifficulty === "intermediate"
                      ? "bg-yellow-500 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  Intermediate
                </button>
                <button
                  onClick={() => setSelectedDifficulty("advanced")}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedDifficulty === "advanced"
                      ? "bg-red-500 text-white"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-white/60">
          Showing {filteredCases.length} of {testCases.length} test cases
        </div>

        {/* Test Cases */}
        <div className="space-y-4">
          {filteredCases.map((testCase) => {
            const isExpanded = expandedCase === testCase.id;
            const categoryColor = CATEGORY_COLORS[testCase.category] || "border-l-white/20";

            return (
              <div
                key={testCase.id}
                className={`rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all ${
                  isExpanded ? "shadow-lg shadow-white/5" : ""
                }`}
              >
                <button
                  onClick={() => setExpandedCase(isExpanded ? null : testCase.id)}
                  className={`w-full text-left p-6 border-l-4 ${categoryColor} hover:bg-white/10 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{testCase.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${
                            DIFFICULTY_COLORS[testCase.difficulty as keyof typeof DIFFICULTY_COLORS]
                          }`}
                        >
                          {testCase.difficulty}
                        </span>
                      </div>
                      <p className="text-white/70 mb-3">{testCase.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {testCase.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-md bg-white/5 text-xs text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-white/40 text-2xl">{isExpanded ? "−" : "+"}</div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 p-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-2">SETUP</h4>
                      <p className="text-white/80">{testCase.setup}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-2">INPUT</h4>
                      <div className="rounded-lg bg-black/30 border border-white/10 p-4">
                        <code className="text-sm text-green-400">{testCase.input}</code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-2">EXPECTED BEHAVIOR</h4>
                      <p className="text-white/80">{testCase.expectedBehavior}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-2">COMMON FAILURES</h4>
                      <ul className="space-y-2">
                        {testCase.commonFailures.map((failure, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-white/70">
                            <span className="text-red-400 mt-1">⚠</span>
                            <span>{failure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No test cases found</h3>
            <p className="text-white/60">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
