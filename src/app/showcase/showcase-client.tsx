"use client";

import { useState, useMemo } from "react";
import { ShowcaseAgent } from "./page";
import { Badge } from "@/components/ui/badge";

const categories = [
  "All",
  "Productivity",
  "Development",
  "Creative",
  "Data",
  "Infrastructure",
  "Community",
];

type SortOption = "trust" | "skills" | "newest";

export function ShowcaseClient({ agents }: { agents: ShowcaseAgent[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("trust");

  // Filter and sort
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "trust":
          return b.trustScore - a.trustScore;
        case "skills":
          return b.skillCount - a.skillCount;
        case "newest":
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [agents, selectedCategory, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Productivity: "bg-cyan/10 text-cyan border-cyan/30",
      Development: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
      Creative: "bg-purple/10 text-purple border-purple/30",
      Data: "bg-blue-400/10 text-blue-400 border-blue-400/30",
      Infrastructure: "bg-orange/10 text-orange border-orange/30",
      Community: "bg-pink-400/10 text-pink-400 border-pink-400/30",
    };
    return colors[category] || "bg-slate-500/10 text-slate-400 border-slate-500/30";
  };

  return (
    <>
      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedCategory === category
                    ? "bg-[#06D6A0] text-[#0a0a0a]"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="md:w-48">
          <label
            htmlFor="sort-select"
            className="block text-sm font-semibold text-slate-300 mb-2"
          >
            Sort By
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-4 py-2 bg-slate-800/50 text-slate-300 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06D6A0]/50"
          >
            <option value="trust">Trust Score</option>
            <option value="skills">Most Skills</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400 mb-6">
        Showing {filteredAndSortedAgents.length} {filteredAndSortedAgents.length === 1 ? "agent" : "agents"}
      </div>

      {/* Agent Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedAgents.map((agent) => (
          <a
            key={agent.id}
            href={agent.profileUrl}
            className="group bg-slate-900/30 border border-white/10 rounded-xl p-6 hover:border-[#06D6A0]/50 hover:shadow-lg hover:shadow-[#06D6A0]/5 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{agent.avatar}</div>
                <div>
                  <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#06D6A0] transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-400">@{agent.handle}</p>
                </div>
              </div>
            </div>

            {/* Category Badge */}
            <div className="mb-3">
              <Badge
                className={`text-xs font-semibold border ${getCategoryColor(agent.category)}`}
              >
                {agent.category}
              </Badge>
            </div>

            {/* Creator */}
            <div className="text-xs text-slate-400 mb-3">
              by <span className="text-slate-300">{agent.creator}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-4 line-clamp-3">
              {agent.description}
            </p>

            {/* Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Skills</span>
                <span className="font-semibold text-cyan">{agent.skillCount}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Trust Score</span>
                  <span className="font-semibold text-emerald-400">{agent.trustScore}%</span>
                </div>
                {/* Trust Score Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${agent.trustScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* View Profile CTA */}
            <div className="text-sm font-semibold text-[#06D6A0] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              View Profile
              <span className="text-lg">→</span>
            </div>
          </a>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">
            No agents found
          </h3>
          <p className="text-slate-400">
            Try adjusting your filters or exploring different categories.
          </p>
        </div>
      )}
    </>
  );
}
