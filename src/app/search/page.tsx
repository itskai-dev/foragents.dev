"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

type CompatibilityKey = "openclaw" | "claude" | "gpt" | "gemini";

const RECENT_SEARCHES_KEY = "fa_recent_searches";
const RECENT_SEARCHES_MAX = 8;

const COMPATIBILITY_OPTIONS: Array<{ key: CompatibilityKey; label: string; matchTags: string[] }>= [
  { key: "openclaw", label: "OpenClaw", matchTags: ["openclaw"] },
  { key: "claude", label: "Claude", matchTags: ["claude", "claude-code"] },
  { key: "gpt", label: "GPT / OpenAI", matchTags: ["gpt", "openai", "codex"] },
  { key: "gemini", label: "Gemini", matchTags: ["gemini"] },
];

const CATEGORY_TAG_ORDER = [
  "autonomy",
  "memory",
  "security",
  "coding",
  "productivity",
  "knowledge",
  "summarization",
  "transcription",
  "creative",
  "calendar",
  "github",
  "databases",
  "notes",
  "weather",
  "music",
] as const;

function clampText(input: string, maxLen: number): string {
  const s = (input || "").trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function formatNumber(n: number): string {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

function normalize(s: string): string {
  return (s || "").toLowerCase().trim();
}

function getSkillCompatibilityKeys(skill: Skill): CompatibilityKey[] {
  const tags = new Set((skill.tags || []).map(normalize));
  const keys: CompatibilityKey[] = [];

  for (const opt of COMPATIBILITY_OPTIONS) {
    if (opt.matchTags.some((t) => tags.has(normalize(t)))) keys.push(opt.key);
  }

  // Site-wide default: everything in the Skills directory is assumed to work in an agent environment.
  // If the skill didn't explicitly tag itself, don't force compatibility.
  return keys;
}

function pickCategoryTag(skill: Skill): string | null {
  const tags = (skill.tags || []).map(normalize);
  for (const preferred of CATEGORY_TAG_ORDER) {
    const hit = tags.find((t) => t === preferred);
    if (hit) return hit;
  }
  return tags[0] ?? null;
}

function trendingLabel(kind: TrendingBadgeKind): string {
  if (kind === "hot") return "🔥 Hot";
  if (kind === "rising") return "📈 Rising";
  return "⭐ Popular";
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const skills = skillsData as Skill[];

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCompatibility, setSelectedCompatibility] = useState<CompatibilityKey[]>([]);
  const [selectedTrending, setSelectedTrending] = useState<TrendingBadgeKind[]>([]);

  const [trendingBySlug, setTrendingBySlug] = useState<Record<string, TrendingBadgeKind | null>>({});
  const [installsBySlug, setInstallsBySlug] = useState<Record<string, number>>({});

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize query from URL (?q=)
  useEffect(() => {
    const q = searchParams.get("q")?.trim() ?? "";
    if (!q) return;
    setQuery((prev) => (prev === q ? prev : q));
  }, [searchParams]);

  // Load recent searches (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : null;
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((s) => typeof s === "string").slice(0, RECENT_SEARCHES_MAX));
      }
    } catch {
      // ignore
    }
  }, []);

  // Close suggestions on click outside.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Fetch trending badges.
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
        // best-effort
      }
    }

    void fetchTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch install counts.
  useEffect(() => {
    let cancelled = false;

    async function fetchInstalls() {
      try {
        const res = await fetch("/api/track/install", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Record<string, unknown>;

        const map: Record<string, number> = {};
        for (const [slug, count] of Object.entries(data)) {
          if (typeof count === "number") map[slug] = count;
        }

        if (!cancelled) setInstallsBySlug(map);
      } catch {
        // best-effort
      }
    }

    void fetchInstalls();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of skills) {
      for (const t of s.tags || []) {
        const k = normalize(t);
        if (!k) continue;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [skills]);

  const compatibilityCounts = useMemo(() => {
    const counts: Record<CompatibilityKey, number> = {
      openclaw: 0,
      claude: 0,
      gpt: 0,
      gemini: 0,
    };

    for (const s of skills) {
      const keys = getSkillCompatibilityKeys(s);
      for (const k of keys) counts[k]++;
    }
    return counts;
  }, [skills]);

  function saveRecentSearch(term: string) {
    const t = term.trim();
    if (!t) return;

    setRecentSearches((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_SEARCHES_MAX);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function toggleCompatibility(key: CompatibilityKey) {
    setSelectedCompatibility((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleTrending(kind: TrendingBadgeKind) {
    setSelectedTrending((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]
    );
  }

  function clearFilters() {
    setSelectedTags([]);
    setSelectedCompatibility([]);
    setSelectedTrending([]);
  }

  const searchTerm = normalize(query);

  const filteredSkills = useMemo(() => {
    const hasQuery = !!searchTerm;

    const queryFiltered = skills.filter((skill) => {
      if (!hasQuery) return true;

      const name = normalize(skill.name);
      const desc = normalize(skill.description);
      const tags = (skill.tags || []).map(normalize);

      return (
        name.includes(searchTerm) ||
        desc.includes(searchTerm) ||
        tags.some((t) => t.includes(searchTerm))
      );
    });

    const tagFiltered = selectedTags.length
      ? queryFiltered.filter((skill) => {
          const tags = new Set((skill.tags || []).map(normalize));
          return selectedTags.some((t) => tags.has(t));
        })
      : queryFiltered;

    const compatFiltered = selectedCompatibility.length
      ? tagFiltered.filter((skill) => {
          const keys = new Set(getSkillCompatibilityKeys(skill));
          return selectedCompatibility.some((k) => keys.has(k));
        })
      : tagFiltered;

    const trendingFiltered = selectedTrending.length
      ? compatFiltered.filter((skill) => {
          const badge = trendingBySlug[skill.slug] ?? null;
          if (!badge) return false;
          return selectedTrending.includes(badge);
        })
      : compatFiltered;

    function score(skill: Skill): number {
      const badge = trendingBySlug[skill.slug] ?? null;
      const installs = installsBySlug[skill.slug] ?? 0;

      let s = 0;
      if (hasQuery) {
        const name = normalize(skill.name);
        const desc = normalize(skill.description);
        const tags = (skill.tags || []).map(normalize);

        if (name.includes(searchTerm)) s += 200;
        if (tags.some((t) => t.includes(searchTerm))) s += 120;
        if (desc.includes(searchTerm)) s += 60;
      }

      // Small tie-breakers:
      if (badge === "hot") s += 20;
      if (badge === "rising") s += 12;
      if (badge === "popular") s += 6;

      s += Math.log1p(installs);

      return s;
    }

    return [...trendingFiltered].sort((a, b) => score(b) - score(a));
  }, [skills, searchTerm, selectedTags, selectedCompatibility, selectedTrending, trendingBySlug, installsBySlug]);

  const skillSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return filteredSkills.slice(0, 6);
  }, [filteredSkills, searchTerm]);

  const tagSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    const hits = allTags.filter((t) => t.includes(searchTerm) && !selectedTags.includes(t));
    return hits.slice(0, 8);
  }, [allTags, searchTerm, selectedTags]);

  const hasActiveFilters = selectedTags.length > 0 || selectedCompatibility.length > 0 || selectedTrending.length > 0;
  const showResults = searchTerm.length > 0 || hasActiveFilters;

  return (
    <div className="min-h-screen">
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="aurora-text">Search Skills</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Search through {skills.length} skills — now with filters, suggestions, and recent searches
        </p>

        {/* Search + suggestions */}
        <div className="relative mb-6" ref={containerRef}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q) {
                saveRecentSearch(q);
                // Keep the URL in sync (handy for sharing).
                router.replace(`/search?q=${encodeURIComponent(q)}`);
              }
              setShowSuggestions(false);
            }}
          >
            <label htmlFor="search-input" className="sr-only">
              Search for skills by name, description, or tags
            </label>
            <input
              id="search-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for skills, tags, or compatibility…"
              className="w-full h-12 px-4 pr-12 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 font-mono text-sm transition-colors"
              aria-label="Search for skills"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions}
              role="searchbox"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
              🔍
            </div>
          </form>

          {showSuggestions && (
            <div
              id="search-suggestions"
              className="absolute z-20 mt-2 w-full rounded-lg border border-white/10 bg-[#0A0E17] shadow-xl shadow-black/40 overflow-hidden"
              role="listbox"
              aria-label="Search suggestions"
            >
              {/* Recent searches */}
              {!searchTerm && recentSearches.length > 0 && (
                <div className="p-3 border-b border-white/5">
                  <p className="text-xs text-muted-foreground mb-2">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                        onClick={() => {
                          setQuery(r);
                          saveRecentSearch(r);
                          router.replace(`/search?q=${encodeURIComponent(r)}`);
                          setShowSuggestions(false);
                          inputRef.current?.focus();
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill suggestions */}
              {searchTerm && (
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-2">Top matches</p>
                  {skillSuggestions.length === 0 ? (
                    <p className="text-sm text-white/70">No suggestions.</p>
                  ) : (
                    <ul className="grid gap-1">
                      {skillSuggestions.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/skills/${s.slug}`}
                            className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-white/5"
                            onClick={() => {
                              saveRecentSearch(query);
                              setShowSuggestions(false);
                            }}
                          >
                            <span className="text-sm text-white/90">{s.name}</span>
                            <span className="text-xs text-muted-foreground">/skills/{s.slug}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {tagSuggestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <p className="text-xs text-muted-foreground mb-2">Tag suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {tagSuggestions.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                            onClick={() => {
                              toggleTag(t);
                              setShowSuggestions(false);
                              inputRef.current?.focus();
                            }}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!searchTerm && recentSearches.length === 0 && (
                <div className="p-3">
                  <p className="text-sm text-white/70">Tip: Press Enter to save your search for quick access later.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <UpgradeCTA variant="inline" message="Get personalized recommendations" ctaId="search" />

        {/* Facets */}
        <section className="rounded-lg border border-white/10 bg-card/30 p-4 mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Filters</h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-cyan transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Category / tag</p>
              {allTags.length > 14 && (
                <button
                  type="button"
                  onClick={() => setShowAllTags((v) => !v)}
                  className="text-xs text-muted-foreground hover:text-cyan transition-colors"
                  aria-expanded={showAllTags}
                >
                  {showAllTags ? "Show less" : "Show all"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {(showAllTags ? allTags : allTags.slice(0, 14)).map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={
                      "text-xs px-2 py-1 rounded-md border transition-colors " +
                      (active
                        ? "bg-cyan/15 border-cyan/30 text-cyan"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10")
                    }
                    aria-pressed={active}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compatibility */}
          <div className="mb-5">
            <p className="text-xs text-muted-foreground">Compatibility</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMPATIBILITY_OPTIONS.map((opt) => {
                const active = selectedCompatibility.includes(opt.key);
                const count = compatibilityCounts[opt.key] ?? 0;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleCompatibility(opt.key)}
                    className={
                      "text-xs px-2 py-1 rounded-md border transition-colors " +
                      (active
                        ? "bg-purple/20 border-purple/30 text-purple"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10")
                    }
                    aria-pressed={active}
                  >
                    {opt.label}
                    <span className="text-white/30"> · {count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trending */}
          <div>
            <p className="text-xs text-muted-foreground">Trending</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["hot", "rising", "popular"] as TrendingBadgeKind[]).map((k) => {
                const active = selectedTrending.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleTrending(k)}
                    className={
                      "text-xs px-2 py-1 rounded-md border transition-colors " +
                      (active
                        ? "bg-yellow/15 border-yellow/30 text-yellow"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10")
                    }
                    aria-pressed={active}
                  >
                    {trendingLabel(k)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Result Count */}
        {showResults && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredSkills.length} result{filteredSkills.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Results */}
        {showResults && filteredSkills.length > 0 && (
          <div className="grid gap-4">
            {filteredSkills.map((skill) => {
              const badge = trendingBySlug[skill.slug] ?? null;
              const installs = installsBySlug[skill.slug] ?? 0;
              const category = pickCategoryTag(skill);
              const compatKeys = getSkillCompatibilityKeys(skill);

              return (
                <Link
                  key={skill.slug}
                  href={`/skills/${skill.slug}`}
                  className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-6 hover:border-cyan/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <h2 className="text-xl font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                      {skill.name}
                    </h2>
                    <SkillTrendingBadge badge={badge} />
                  </div>

                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    {clampText(skill.description, 180)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {category && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-white/5 text-white/70 border-white/10"
                      >
                        {category}
                      </Badge>
                    )}

                    {compatKeys.map((k) => {
                      const label = COMPATIBILITY_OPTIONS.find((o) => o.key === k)?.label ?? k;
                      return (
                        <Badge
                          key={k}
                          variant="outline"
                          className="text-xs bg-purple/10 text-purple border-purple/25"
                        >
                          {label}
                        </Badge>
                      );
                    })}

                    <Badge
                      variant="outline"
                      className="text-xs bg-black/30 text-cyan border-cyan/20"
                      title={`${installs} installs`}
                    >
                      ⬇ {formatNumber(installs)} installs
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(skill.tags || []).slice(0, 6).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-white/5 text-white/60 border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">by {skill.author}</p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {showResults && filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg text-foreground mb-2">No skills found</p>
            <p className="text-sm text-muted-foreground">
              Try different keywords, or adjust your filters.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!showResults && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">⌘K</p>
            <p className="text-lg text-foreground mb-2">Start searching</p>
            <p className="text-sm text-muted-foreground">
              Type a keyword, or use filters to browse.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
