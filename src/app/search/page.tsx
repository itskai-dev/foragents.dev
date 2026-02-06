"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

interface SearchResults {
  query: string;
  total: number;
  news: Array<{ title: string; summary: string; source_name: string; source_url: string; published_at: string }>;
  skills: Array<{ name: string; description: string; slug: string; install_cmd: string; tags: string[] }>;
  mcpServers: Array<{ name: string; description: string; category: string; tags: string[]; slug?: string }>;
  agents: Array<{ name: string; handle: string; description: string; role: string; platforms: string[] }>;
  acpAgents: Array<{ name: string; description: string; category: string; ides: string[]; tags: string[]; repository: string }>;
  llmsTxtSites: Array<{ title: string; domain: string; description: string; url: string; sections: string[] }>;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [quotaBlocked, setQuotaBlocked] = useState<null | { message: string; upgrade_url: string }>(null);

  useEffect(() => {
    if (!initialQuery) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(initialQuery)}`)
      .then(async (res) => {
        if (res.status === 429) {
          const body = (await res.json().catch(() => null)) as
            | { message?: string; upgrade_url?: string }
            | null;
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setQuotaBlocked({
            message: body?.message || "You’ve hit today’s search limit.",
            upgrade_url: body?.upgrade_url || "/pricing",
          });
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setResults(null);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoading(false);
          // Minimal event
          // eslint-disable-next-line no-console
          console.log("[event] paywall_hit", {
            paywall_type: "search_quota",
            surface: "web",
            path: "/search",
            q_len: initialQuery.length,
          });
          return;
        }

        const data = (await res.json()) as SearchResults;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuotaBlocked(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResults(data);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      })
      .catch(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      });
  }, [initialQuery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      {/* Search Input */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">
          <span className="aurora-text">Search</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Find agents, skills, MCP servers, ACP agents, llms.txt sites, and news across forAgents.dev
        </p>

        <form onSubmit={handleSubmit} className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tools, agents, skills..."
            className="w-full h-12 px-4 pr-24 rounded-lg bg-card border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 font-mono text-sm transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 rounded-md bg-cyan text-[#0A0E17] font-semibold text-xs hover:brightness-110 transition-all"
          >
            Search
          </button>
        </form>

        <p className="text-xs text-muted-foreground font-mono mb-4">
          Agent endpoint:{" "}
          <a href="/api/search.md?q=example" className="text-cyan hover:underline">
            GET /api/search.md?q=…
          </a>
        </p>

        {/* Quota paywall */}
        {quotaBlocked && !loading && (
          <div className="mb-6 rounded-lg border border-cyan/20 bg-cyan/5 p-4">
            <p className="font-semibold text-foreground mb-1">You’ve hit today’s search limit.</p>
            <p className="text-sm text-muted-foreground mb-3">{quotaBlocked.message}</p>
            <ul className="text-sm text-muted-foreground mb-4 list-disc pl-5">
              <li>Unlimited search across the directory</li>
              <li>Priority access + faster discovery</li>
            </ul>
            <div className="flex items-center gap-3">
              <Link
                href={`${quotaBlocked.upgrade_url}?src=search_limit`}
                className="inline-flex items-center justify-center h-9 px-4 rounded-md bg-cyan text-[#0A0E17] font-semibold text-xs hover:brightness-110 transition-all"
                onClick={() => {
                  // eslint-disable-next-line no-console
                  console.log("[event] upgrade_click", {
                    source: "search_limit",
                    surface: "web",
                    cta_placement: "inline",
                    path: "/search",
                  });
                }}
              >
                Upgrade to Premium
              </Link>
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                See free feed
              </Link>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-muted-foreground text-sm py-8 text-center">
            Searching…
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              {results.total} result{results.total !== 1 ? "s" : ""} for &ldquo;
              {initialQuery}&rdquo;
            </p>

            {results.total === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or browse the{" "}
                  <Link href="/" className="text-cyan hover:underline">
                    homepage
                  </Link>
                  .
                </p>
              </div>
            )}

            {/* Agents */}
            {results.agents.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#8B5CF6]">●</span> Agents ({results.agents.length})
                </h2>
                <div className="grid gap-2">
                  {results.agents.map((agent) => (
                    <Link
                      key={agent.handle}
                      href={`/agents/${agent.handle}`}
                      className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-4 hover:border-cyan/20 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                            {agent.name}
                          </span>
                          <span className="text-muted-foreground text-sm ml-2">
                            @{agent.handle}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {agent.role}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1">
                        {agent.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {results.skills.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#F59E0B]">●</span> Skills ({results.skills.length})
                </h2>
                <div className="grid gap-2">
                  {results.skills.map((skill) => (
                    <Link
                      key={skill.slug}
                      href={`/skills/${skill.slug}`}
                      className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-4 hover:border-cyan/20 transition-all group"
                    >
                      <span className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                        {skill.name}
                      </span>
                      <p className="text-sm text-foreground/80 mt-1">
                        {skill.description}
                      </p>
                      <code className="block text-xs text-green bg-black/30 rounded px-2 py-1 mt-2">
                        {skill.install_cmd}
                      </code>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* MCP Servers */}
            {results.mcpServers.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#06D6A0]">●</span> MCP Servers ({results.mcpServers.length})
                </h2>
                <div className="grid gap-2">
                  {results.mcpServers.map((server) => (
                    <div
                      key={server.name}
                      className="rounded-lg border border-[#1A1F2E] bg-card/50 p-4"
                    >
                      <span className="font-semibold text-[#F8FAFC]">
                        {server.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {server.category}
                      </span>
                      <p className="text-sm text-foreground/80 mt-1">
                        {server.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACP Agents */}
            {results.acpAgents && results.acpAgents.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#EC4899]">●</span> ACP Agents ({results.acpAgents.length})
                </h2>
                <div className="grid gap-2">
                  {results.acpAgents.map((agent) => (
                    <a
                      key={agent.name}
                      href={agent.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-4 hover:border-cyan/20 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                          {agent.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {agent.category}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1">
                        {agent.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        IDEs: {agent.ides.join(", ")}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* llms.txt Sites */}
            {results.llmsTxtSites && results.llmsTxtSites.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#F97316]">●</span> llms.txt Sites ({results.llmsTxtSites.length})
                </h2>
                <div className="grid gap-2">
                  {results.llmsTxtSites.map((site) => (
                    <a
                      key={site.domain}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-4 hover:border-cyan/20 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                          {site.title}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {site.domain}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1">
                        {site.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Sections: {site.sections.join(", ")}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* News */}
            {results.news.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-[#3B82F6]">●</span> News ({results.news.length})
                </h2>
                <div className="grid gap-2">
                  {results.news.map((item) => (
                    <a
                      key={item.title}
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-[#1A1F2E] bg-card/50 p-4 hover:border-cyan/20 transition-all group"
                    >
                      <span className="font-semibold text-[#F8FAFC] group-hover:text-cyan transition-colors">
                        {item.title}
                      </span>
                      <p className="text-sm text-foreground/80 mt-1">
                        {item.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.source_name} · {item.published_at}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No search yet */}
        {!results && !loading && !initialQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">🔍</p>
            <p className="text-muted-foreground">
              Type a query above to search across all content.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold aurora-text">⚡ Agent Hub</span>
            <span className="text-xs text-muted-foreground font-mono">
              forAgents.dev
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
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
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
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

      <Suspense
        fallback={
          <div className="max-w-3xl mx-auto px-4 py-12 text-muted-foreground">
            Loading…
          </div>
        }
      >
        <SearchContent />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a
              href="https://reflectt.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="aurora-text font-semibold hover:opacity-80 transition-opacity"
            >
              Team Reflectt
            </a>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <a href="/llms.txt" className="hover:text-cyan transition-colors">
              llms.txt
            </a>
            <a
              href="/api/feed.md"
              className="hover:text-cyan transition-colors"
            >
              feed.md
            </a>
            <a
              href="https://github.com/reflectt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
