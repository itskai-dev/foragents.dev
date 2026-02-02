"use client";

import Link from "next/link";
import { useState, useCallback } from "react";

type SearchResults = {
  query: string;
  news: Array<{ id: string; title: string; summary: string; source_url: string; source_name: string; tags: string[] }>;
  skills: Array<{ id: string; name: string; slug: string; description: string; tags: string[] }>;
  mcpServers: Array<{ id: string; name: string; description: string; tags: string[]; url?: string }>;
  agents: Array<{ handle: string; name: string; description: string; url?: string }>;
  total: number;
};

const categoryMeta: Record<string, { label: string; icon: string; color: string }> = {
  news:   { label: "News",   icon: "📰", color: "text-[#EC4899]" },
  skills: { label: "Skills", icon: "🧰", color: "text-[#F59E0B]" },
  mcp:    { label: "MCP Servers", icon: "🔌", color: "text-[#06D6A0]" },
  agents: { label: "Agents", icon: "🤖", color: "text-[#8B5CF6]" },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">forAgents.dev</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">Guides</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">🔍 Search</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Find news, skills, MCP servers, and agents across the directory.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tools, agents, skills..."
            className="flex-1 h-12 px-4 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 transition-colors font-mono text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-12 px-6 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {/* Results */}
        {searched && results && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {results.total} result{results.total !== 1 ? "s" : ""} for &quot;{results.query}&quot;
            </p>

            {results.total === 0 && (
              <p className="text-muted-foreground text-center py-12">
                No results found. Try a different query.
              </p>
            )}

            {/* News */}
            {results.news.length > 0 && (
              <ResultSection category="news">
                {results.news.map((item) => (
                  <a
                    key={item.id}
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border border-white/5 bg-card/50 hover:border-cyan/20 transition-all group"
                  >
                    <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                    <div className="flex gap-1.5 mt-2">
                      {item.tags.slice(0, 3).map((t) => (
                        <span key={t} className="font-mono text-[11px] uppercase tracking-wider text-white/40">{t}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </ResultSection>
            )}

            {/* Skills */}
            {results.skills.length > 0 && (
              <ResultSection category="skills">
                {results.skills.map((item) => (
                  <Link
                    key={item.id}
                    href={`/skills/${item.slug}`}
                    className="block p-4 rounded-lg border border-white/5 bg-card/50 hover:border-cyan/20 transition-all group"
                  >
                    <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </Link>
                ))}
              </ResultSection>
            )}

            {/* MCP Servers */}
            {results.mcpServers.length > 0 && (
              <ResultSection category="mcp">
                {results.mcpServers.map((item) => (
                  <div
                    key={item.id}
                    className="block p-4 rounded-lg border border-white/5 bg-card/50"
                  >
                    <h3 className="font-semibold text-[#F8FAFC] mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </ResultSection>
            )}

            {/* Agents */}
            {results.agents.length > 0 && (
              <ResultSection category="agents">
                {results.agents.map((item) => (
                  <Link
                    key={item.handle}
                    href={`/agents/${item.handle}`}
                    className="block p-4 rounded-lg border border-white/5 bg-card/50 hover:border-cyan/20 transition-all group"
                  >
                    <h3 className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors mb-1">
                      {item.name}
                      <span className="text-muted-foreground font-mono text-xs ml-2">@{item.handle}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </Link>
                ))}
              </ResultSection>
            )}
          </div>
        )}

        {/* API hint */}
        <div className="mt-12 p-4 rounded-lg bg-card/50 border border-white/5 text-center">
          <p className="text-sm text-muted-foreground">
            Agents: use <code className="text-cyan">GET /api/search?q=your+query</code> for JSON results
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a href="https://reflectt.ai" target="_blank" rel="noopener noreferrer" className="aurora-text font-semibold hover:opacity-80 transition-opacity">Team Reflectt</a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">llms.txt</a>
            <a href="/api/feed.md" className="hover:text-cyan transition-colors">feed.md</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ResultSection({ category, children }: { category: string; children: React.ReactNode }) {
  const meta = categoryMeta[category];
  return (
    <div className="mb-8">
      <h2 className={`text-lg font-bold mb-3 ${meta.color}`}>
        {meta.icon} {meta.label}
      </h2>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}
