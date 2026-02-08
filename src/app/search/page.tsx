"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import skillsData from "@/data/skills.json";
import { Badge } from "@/components/ui/badge";
import { SkillTrendingBadge } from "@/components/skill-trending-badge";
import type { TrendingBadgeKind } from "@/lib/trendingTypes";
import { UpgradeCTA } from "@/components/UpgradeCTA";

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const skills = skillsData as Skill[];

  const [trendingBySlug, setTrendingBySlug] = useState<Record<string, TrendingBadgeKind | null>>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending/skills");
        if (!res.ok) return;
        const data = (await res.json()) as {
          skills?: Array<{ slug: string; trendingBadge: TrendingBadgeKind | null }>;
        };

        const map: Record<string, TrendingBadgeKind | null> = {};
        for (const s of data.skills ?? []) {
          map[s.slug] = s.trendingBadge;
        }

        if (!cancelled) setTrendingBySlug(map);
      } catch {
        // Best-effort; ignore.
      }
    }

    void fetchTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  // Client-side filtering
  const filteredSkills = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return skills.filter((skill) => {
      const matchesName = skill.name.toLowerCase().includes(searchTerm);
      const matchesDescription = skill.description.toLowerCase().includes(searchTerm);
      const matchesTags = skill.tags.some((tag) => tag.toLowerCase().includes(searchTerm));
      
      return matchesName || matchesDescription || matchesTags;
    });
  }, [query, skills]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80" role="banner">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="forAgents.dev home">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm" role="navigation" aria-label="Main navigation">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/guides"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Guides
            </Link>
            <Link
              href="/search"
              className="text-foreground font-medium transition-colors"
            >
              Search
            </Link>
            <Link
              href="/llms.txt"
              className="text-muted-foreground hover:text-cyan font-mono text-xs transition-colors"
            >
              /llms.txt
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="aurora-text">Search Skills</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Search through {skills.length} skills by name, description, or tags
        </p>

        {/* Search Input */}
        <div className="relative mb-8">
          <label htmlFor="search-input" className="sr-only">
            Search for skills by name, description, or tags
          </label>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for skills..."
            className="w-full h-12 px-4 pr-12 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 font-mono text-sm transition-colors"
            autoFocus
            aria-label="Search for skills"
            role="searchbox"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
            🔍
          </div>
        </div>

        <UpgradeCTA
          variant="inline"
          message="Get personalized recommendations"
          ctaId="search"
        />

        {/* Result Count */}
        {query.trim() && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredSkills.length} result{filteredSkills.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Results */}
        {query.trim() && filteredSkills.length > 0 && (
          <div className="grid gap-4">
            {filteredSkills.map((skill) => (
              <Link
                key={skill.slug}
                href={`/skills/${skill.slug}`}
                className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-6 hover:border-cyan/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-2 gap-3">
                  <h2 className="text-xl font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                    {skill.name}
                  </h2>
                  <SkillTrendingBadge badge={trendingBySlug[skill.slug]} />
                </div>
                
                <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                  {skill.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {skill.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs bg-white/5 text-white/60 border-white/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="relative group/code">
                  <pre className="bg-black/40 border border-white/10 rounded-lg p-3 overflow-x-auto">
                    <code className="text-xs text-green font-mono">
                      {skill.install_cmd}
                    </code>
                  </pre>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  by {skill.author}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {query.trim() && filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg text-foreground mb-2">No skills found</p>
            <p className="text-sm text-muted-foreground">
              Try different keywords or browse{" "}
              <Link href="/#skills" className="text-cyan hover:underline">
                all skills
              </Link>
            </p>
          </div>
        )}

        {/* Initial State */}
        {!query.trim() && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg text-foreground mb-2">Start searching</p>
            <p className="text-sm text-muted-foreground">
              Type a keyword to search through all available skills
            </p>
          </div>
        )}
      </main>

    </div>
  );
}
