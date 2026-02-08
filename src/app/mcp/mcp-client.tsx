"use client";

import { useMemo, useState } from "react";
import type { McpServer, McpServerCategory } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { RunInReflecttButton } from "@/components/RunInReflecttButton";

const categoryStyles: Record<McpServerCategory, { bg: string; text: string; border: string }> = {
  "file-system": { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  database: { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]", border: "border-[#06D6A0]/20" },
  API: { bg: "bg-[#3B82F6]/10", text: "text-[#3B82F6]", border: "border-[#3B82F6]/20" },
  coding: { bg: "bg-[#8B5CF6]/10", text: "text-[#8B5CF6]", border: "border-[#8B5CF6]/20" },
  search: { bg: "bg-cyan/10", text: "text-cyan", border: "border-cyan/20" },
  communication: { bg: "bg-[#EC4899]/10", text: "text-[#EC4899]", border: "border-[#EC4899]/20" },
};

const categoryTabs: Array<{ key: "all" | McpServerCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "file-system", label: "File System" },
  { key: "database", label: "Database" },
  { key: "API", label: "API" },
  { key: "coding", label: "Coding" },
  { key: "search", label: "Search" },
  { key: "communication", label: "Communication" },
];

function normalizeCategory(c: string) {
  return c.toLowerCase();
}

function getCategoryStyle(category: unknown) {
  const fallback = { bg: "bg-white/5", text: "text-white/70", border: "border-white/10" };
  if (!category || typeof category !== "string") return fallback;
  return (
    // @ts-expect-error - tolerate legacy categories at runtime
    categoryStyles[category] ||
    fallback
  );
}

function getRepoUrl(server: McpServer): string {
  const s = server as unknown as Record<string, unknown>;
  const repo = (s.repo_url || s.github || s.url) as string | undefined;
  return typeof repo === "string" ? repo : "";
}

function getCompatTags(server: McpServer): string[] {
  const s = server as unknown as Record<string, unknown>;
  const tags = (s.compatibility || s.tags) as string[] | undefined;
  return Array.isArray(tags) ? tags : [];
}

export function McpHubClient({ servers }: { servers: McpServer[] }) {
  const [activeCategory, setActiveCategory] = useState<"all" | McpServerCategory>("all");
  const [query, setQuery] = useState<string>("");

  const featured = useMemo(() => servers.filter((s) => s.featured).slice(0, 5), [servers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return servers.filter((s) => {
      const inCategory =
        activeCategory === "all" || normalizeCategory(s.category) === normalizeCategory(activeCategory);
      const inQuery = !q || s.name.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [servers, activeCategory, query]);

  const showFeatured = activeCategory === "all" && query.trim() === "" && featured.length > 0;

  return (
    <div className="space-y-10">
      {/* Controls */}
      <div className="space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <label htmlFor="mcp-search" className="sr-only">
              Search MCP servers
            </label>
            <input
              id="mcp-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan/30"
            />
          </div>

          <div className="text-xs font-mono text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categoryTabs.map((tab) => {
            const active = tab.key === activeCategory;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={
                  "px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors " +
                  (active
                    ? "bg-cyan/10 text-cyan border-cyan/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:text-white hover:border-white/20")
                }
                aria-pressed={active}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured */}
      {showFeatured && (
        <section aria-label="Featured MCP servers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Featured</h2>
            <span className="text-xs font-mono text-muted-foreground">Top {featured.length}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((server) => {
              const style = getCategoryStyle(server.category);
              const repoUrl = getRepoUrl(server);
              const compat = getCompatTags(server);
              return (
                <Card
                  key={server.id}
                  className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={
                          "inline-block font-mono text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md border " +
                          `${style.bg} ${style.text} ${style.border}`
                        }
                      >
                        {String(server.category)}
                      </span>
                      {repoUrl ? (
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-cyan transition-colors font-mono"
                        >
                          Repo ↗
                        </a>
                      ) : null}
                    </div>
                    <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                      {server.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {server.description}
                    </p>

                    <div className="relative">
                      <code className="block text-xs text-green bg-black/30 rounded px-3 py-2 pr-12 mb-3 overflow-x-auto font-mono">
                        $ {server.install_cmd}
                      </code>
                      <CopyButton
                        text={server.install_cmd}
                        label="Install command"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1.5 right-1.5 h-8 w-8 text-white/70 hover:text-white"
                      />
                    </div>

                    <RunInReflecttButton
                      skillSlug={server.slug}
                      name={server.name}
                      size="xs"
                      className="mb-3"
                    />

                    <div className="flex flex-wrap gap-1">
                      {compat.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] bg-white/5 text-white/60 border-white/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Directory */}
      <section aria-label="MCP server directory" className="space-y-4">
        <h2 className="text-lg font-bold">All Servers</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((server) => {
            const style = getCategoryStyle(server.category);
            const repoUrl = getRepoUrl(server);
            const compat = getCompatTags(server);

            return (
              <Card
                key={server.id}
                className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={
                        "inline-block font-mono text-[11px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md border " +
                        `${style.bg} ${style.text} ${style.border}`
                      }
                    >
                      {String(server.category)}
                    </span>
                    {repoUrl ? (
                      <a
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-cyan transition-colors font-mono"
                      >
                        Repo ↗
                      </a>
                    ) : null}
                  </div>
                  <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                    {server.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {server.description}
                  </p>

                  <div className="relative">
                    <code className="block text-xs text-green bg-black/30 rounded px-3 py-2 pr-12 mb-3 overflow-x-auto font-mono">
                      $ {server.install_cmd}
                    </code>
                    <CopyButton
                      text={server.install_cmd}
                      label="Install command"
                      size="icon"
                      variant="ghost"
                      className="absolute top-1.5 right-1.5 h-8 w-8 text-white/70 hover:text-white"
                    />
                  </div>

                  <RunInReflecttButton
                    skillSlug={server.slug}
                    name={server.name}
                    size="xs"
                    className="mb-3"
                  />

                  <div className="flex flex-wrap gap-1">
                    {compat.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] bg-white/5 text-white/60 border-white/10"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">No servers match your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
