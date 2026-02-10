"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type ChangelogCategory, type ChangelogEntry } from "@/lib/changelog";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function labelCategory(category: ChangelogCategory): string {
  if (category === "feature") return "Feature";
  if (category === "bugfix") return "Bugfix";
  if (category === "docs") return "Docs";
  return "Feature";
}

const categoryColors: Record<ChangelogCategory, string> = {
  feature: "bg-cyan/10 text-cyan border-cyan/30",
  bugfix: "bg-green/10 text-green border-green/30",
  docs: "bg-blue/10 text-blue border-blue/30",
};

type DateGroup = { date: string; entries: ChangelogEntry[] };

function groupByDate(entries: ChangelogEntry[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === entry.date) {
      last.entries.push(entry);
    } else {
      groups.push({ date: entry.date, entries: [entry] });
    }
  }
  return groups;
}

type FilterCategory = "all" | ChangelogCategory;

interface ChangelogContentProps {
  entries: ChangelogEntry[];
}

export function ChangelogContent({ entries }: ChangelogContentProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recentEntries = entries.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= thirtyDaysAgo;
    });

    const features = recentEntries.filter((e) => e.category === "feature").length;
    const fixes = recentEntries.filter((e) => e.category === "bugfix").length;

    return {
      total: recentEntries.length,
      features,
      fixes,
    };
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (selectedFilter === "all") return entries;
    return entries.filter((e) => e.category === selectedFilter);
  }, [entries, selectedFilter]);

  const groups = groupByDate(filteredEntries);

  const filters: { id: FilterCategory; label: string }[] = [
    { id: "all", label: "All" },
    { id: "feature", label: "Features" },
    { id: "bugfix", label: "Bugfixes" },
    { id: "docs", label: "Docs" },
  ];

  return (
    <>
      {/* Stats Banner */}
      <Card className="bg-gradient-to-br from-cyan/10 to-purple/10 border-white/10 mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan">{stats.total}</div>
              <div className="text-sm text-muted-foreground mt-1">Changes This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan">{stats.features}</div>
              <div className="text-sm text-muted-foreground mt-1">Features Shipped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green">{stats.fixes}</div>
              <div className="text-sm text-muted-foreground mt-1">Bugs Fixed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === filter.id
                ? "bg-cyan text-[#0A0E17]"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <Card className="bg-card/50 border-white/5">
          <CardContent className="p-6 text-muted-foreground">
            No updates found for this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-white/10" />

          <div className="space-y-12">
            {groups.map((group) => (
              <div key={group.date} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan" />
                </div>

                <div className="mb-4">
                  <h2 className="text-sm font-mono text-muted-foreground">
                    {formatDate(group.date)}
                  </h2>
                </div>

                <div className="space-y-4">
                  {group.entries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <h3 className="text-lg font-bold">{entry.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs whitespace-nowrap ${
                              categoryColors[entry.category]
                            }`}
                          >
                            {labelCategory(entry.category)}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-4">
                          {entry.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <Link
                            href={entry.prUrl}
                            className="inline-flex items-center text-sm text-cyan hover:underline font-medium"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View PR #{entry.prNumber} →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
