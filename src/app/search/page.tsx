"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SearchResultType = "skill" | "mcp" | "agent" | "llms-txt" | "blog" | "guide";
type FilterType = "all" | SearchResultType;

type SearchResult = {
  title: string;
  description: string;
  url: string;
  type: SearchResultType;
  score?: number;
};

type SearchResponse = {
  query: string;
  results?: SearchResult[];
  skills?: SearchResult[];
  mcp_servers?: SearchResult[];
  agents?: SearchResult[];
  llmstxt?: SearchResult[];
  blog?: SearchResult[];
  guides?: SearchResult[];
  total: number;
};

const FILTERS: Array<{ key: FilterType; label: string }> = [
  { key: "all", label: "All" },
  { key: "skill", label: "Skills" },
  { key: "mcp", label: "MCP" },
  { key: "agent", label: "Agents" },
  { key: "llms-txt", label: "llms.txt" },
  { key: "blog", label: "Blog" },
  { key: "guide", label: "Guides" },
];

const TYPE_BADGE_CLASS: Record<SearchResultType, string> = {
  skill: "bg-cyan/15 text-cyan border-cyan/30",
  mcp: "bg-purple/15 text-purple border-purple/30",
  agent: "bg-yellow/15 text-yellow border-yellow/30",
  "llms-txt": "bg-green-500/15 text-green-400 border-green-500/30",
  blog: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  guide: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

const TYPE_LABEL: Record<SearchResultType, string> = {
  skill: "Skill",
  mcp: "MCP",
  agent: "Agent",
  "llms-txt": "llms.txt",
  blog: "Blog",
  guide: "Guide",
};

function clampText(input: string, maxLen: number): string {
  const s = (input || "").trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q")?.trim() ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [activeType, setActiveType] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (!urlQuery) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(urlQuery)}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
          throw new Error(body.message || body.error || "Search failed");
        }

        const payload = (await res.json()) as SearchResponse;
        if (!cancelled) {
          setData(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Search failed");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [urlQuery]);

  const allResults = useMemo(() => {
    if (!data) return [] as SearchResult[];

    if (Array.isArray(data.results)) return data.results;

    return [
      ...(data.skills || []),
      ...(data.mcp_servers || []),
      ...(data.agents || []),
      ...(data.llmstxt || []),
      ...(data.blog || []),
      ...(data.guides || []),
    ];
  }, [data]);

  const counts = useMemo(() => {
    const byType: Record<FilterType, number> = {
      all: allResults.length,
      skill: 0,
      mcp: 0,
      agent: 0,
      "llms-txt": 0,
      blog: 0,
      guide: 0,
    };

    for (const item of allResults) {
      byType[item.type] += 1;
    }

    return byType;
  }, [allResults]);

  const filteredResults = useMemo(() => {
    if (activeType === "all") return allResults;
    return allResults.filter((r) => r.type === activeType);
  }, [activeType, allResults]);

  return (
    <div className="min-h-screen">
      <main id="main-content" className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="aurora-text">Search</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Unified search across skills, MCP servers, agents, llms.txt, blog posts, and guides.
        </p>

        <form
          className="mb-6"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (!q) return;
            router.replace(`/search?q=${encodeURIComponent(q)}`);
          }}
        >
          <label htmlFor="search-input" className="sr-only">
            Search everything on forAgents.dev
          </label>
          <div className="relative">
            <input
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills, MCP servers, agents, llms.txt, blog, guides…"
              className="w-full h-12 px-4 pr-12 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 font-mono text-sm transition-colors"
              aria-label="Search"
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
              🔍
            </div>
          </div>
        </form>

        {urlQuery && !loading && !error && (
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
            {activeType !== "all" ? ` in ${FILTERS.find((f) => f.key === activeType)?.label}` : ""}
          </div>
        )}

        {urlQuery && (
          <Tabs value={activeType} onValueChange={(v) => setActiveType(v as FilterType)} className="mb-6">
            <TabsList className="flex w-full flex-wrap h-auto justify-start gap-1 p-1 bg-white/5">
              {FILTERS.map((filter) => (
                <TabsTrigger key={filter.key} value={filter.key} className="mb-1">
                  {filter.label}
                  <span className="ml-1 text-xs opacity-80">{counts[filter.key]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Searching…</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {!urlQuery && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">⌘K</p>
            <p className="text-lg text-foreground mb-2">Start searching</p>
            <p className="text-sm text-muted-foreground">Try a keyword like “security”, “cursor”, or “memory”.</p>
          </div>
        )}

        {urlQuery && !loading && !error && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg text-foreground mb-2">No results found</p>
            <p className="text-sm text-muted-foreground">Try a different query or switch result type.</p>
          </div>
        )}

        {urlQuery && !loading && !error && filteredResults.length > 0 && (
          <div className="grid gap-4">
            {filteredResults.map((result, index) => {
              const isExternal = /^https?:\/\//i.test(result.url);
              const badgeClass = TYPE_BADGE_CLASS[result.type];

              return (
                <Link
                  key={`${result.type}-${result.url}-${index}`}
                  href={result.url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-6 hover:border-cyan/20 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-xs border ${badgeClass}`}>
                      {TYPE_LABEL[result.type]}
                    </Badge>
                  </div>

                  <h2 className="text-xl font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors mb-2">
                    {result.title}
                  </h2>

                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    {clampText(result.description, 220)}
                  </p>

                  <p className="text-xs text-muted-foreground font-mono">
                    {result.url}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
