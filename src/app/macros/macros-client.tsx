"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { MacroTool } from "@/lib/macroTools";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export function MacrosClient({ macros }: { macros: MacroTool[] }) {
  const [query, setQuery] = useState<string>("");
  const [tag, setTag] = useState<string>("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const m of macros) for (const t of m.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [macros]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    const t = normalize(tag);

    return macros.filter((m) => {
      if (t && !m.tags.some((x) => normalize(x) === t)) return false;
      if (!q) return true;

      const haystack = [
        m.name,
        m.description,
        m.author,
        ...m.tags,
        ...m.steps.map((s) => `${s.tool} ${s.server} ${s.description}`),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [macros, query, tag]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-card/40 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold">Browse macros</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Search by name, tag, tool, or MCP server.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Category</span>
              <select
                className="bg-black/30 border border-white/10 rounded-md px-2 py-1 text-sm text-foreground"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="">All</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Search</span>
              <input
                className="bg-black/30 border border-white/10 rounded-md px-2 py-1 text-sm text-foreground w-full sm:w-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. slack, prometheus, release notes"
              />
            </label>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-3">
          Showing <span className="text-foreground font-mono">{filtered.length}</span> of{" "}
          <span className="text-foreground font-mono">{macros.length}</span> macros
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((macro) => (
          <Link key={macro.id} href={`/macros/${macro.id}`}>
            <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all group h-full">
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-cyan transition-colors">
                  <span className="truncate">{macro.name}</span>
                </CardTitle>
                <CardDescription className="text-xs flex flex-wrap items-center gap-2">
                  <span className="font-mono">{macro.steps.length} steps</span>
                  <span className="text-white/20">•</span>
                  <span className="text-cyan font-mono">{macro.installs} installs</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {macro.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {macro.tags.slice(0, 3).map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-xs bg-white/5 text-white/60 border-white/10"
                      >
                        {t}
                      </Badge>
                    ))}
                    {macro.tags.length > 3 ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-white/5 text-white/60 border-white/10"
                      >
                        +{macro.tags.length - 3}
                      </Badge>
                    ) : null}
                  </div>
                  <span className="text-xs text-cyan group-hover:underline">View →</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No macros match that search. Try clearing filters.
        </div>
      ) : null}
    </div>
  );
}
