"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Bounty, BountyStatus } from "@/lib/bounties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SortKey = "newest" | "highest" | "submissions" | "deadline";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatMoney(amount: number, currency: string) {
  if (currency === "USD") return `$${amount}`;
  return `${amount} ${currency}`;
}

function statusLabel(status: BountyStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "claimed":
      return "Claimed";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

function statusBadgeClass(status: BountyStatus) {
  switch (status) {
    case "open":
      return "border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10";
    case "claimed":
      return "border-purple/30 text-purple bg-purple/10";
    case "completed":
      return "border-white/10 text-white/70 bg-white/5";
    default:
      return "border-white/10 text-white/70 bg-white/5";
  }
}

export function BountiesClient({ initialBounties }: { initialBounties: Bounty[] }) {
  const [status, setStatus] = useState<BountyStatus | "all">("open");
  const [tag, setTag] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const b of initialBounties) {
      for (const t of b.tags) tags.add(t);
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [initialBounties]);

  const filtered = useMemo(() => {
    const min = minBudget.trim() === "" ? null : Number(minBudget);
    const max = maxBudget.trim() === "" ? null : Number(maxBudget);

    let items = initialBounties.slice();

    if (status !== "all") {
      items = items.filter((b) => b.status === status);
    }

    if (tag !== "all") {
      const q = tag.toLowerCase();
      items = items.filter((b) => b.tags.some((t) => t.toLowerCase() === q));
    }

    if (min !== null && Number.isFinite(min)) {
      items = items.filter((b) => b.budget >= min);
    }

    if (max !== null && Number.isFinite(max)) {
      items = items.filter((b) => b.budget <= max);
    }

    items.sort((a, b) => {
      switch (sort) {
        case "highest":
          return b.budget - a.budget || b.createdAt.localeCompare(a.createdAt);
        case "submissions":
          return (b.submissions ?? 0) - (a.submissions ?? 0) || b.createdAt.localeCompare(a.createdAt);
        case "deadline":
          return a.deadline.localeCompare(b.deadline) || b.createdAt.localeCompare(a.createdAt);
        case "newest":
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return items;
  }, [initialBounties, maxBudget, minBudget, sort, status, tag]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Open bounties</h2>
          <p className="text-sm text-muted-foreground">
            Fund-a-Kit bounties help prioritize what gets built next.
          </p>
        </div>

        <Button
          asChild
          className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
        >
          <Link href="/requests">Post a Bounty</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-xl border border-white/10 bg-card/20">
        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BountyStatus | "all")}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40"
          >
            <option value="open">Open</option>
            <option value="claimed">Claimed</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Tag</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40"
          >
            <option value="all">All</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Min budget</label>
          <Input
            inputMode="numeric"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            placeholder="0"
            className="mt-1 bg-background/40 border-white/10"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Max budget</label>
          <Input
            inputMode="numeric"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            placeholder="250"
            className="mt-1 bg-background/40 border-white/10"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-white/60">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="mt-1 w-full px-3 py-2 rounded-lg bg-card border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest bounty</option>
            <option value="submissions">Most submissions</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="font-mono">{filtered.length} bounties</div>
        <div className="hidden md:block">Tip: click a bounty to view details</div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <Link key={b.id} href={`/bounties/${encodeURIComponent(b.id)}`} className="block">
            <Card className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-colors h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg text-white/90 truncate">{b.title}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={statusBadgeClass(b.status)}>
                        {statusLabel(b.status)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10"
                        title={b.currency}
                      >
                        {formatMoney(b.budget, b.currency)}
                      </Badge>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-xs text-white/50">Deadline</div>
                    <div className="text-sm text-white/80 font-medium">{formatDate(b.deadline)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">{b.description}</p>

                <div className="flex flex-wrap gap-2">
                  {b.tags.slice(0, 4).map((t) => (
                    <Badge key={t} variant="outline" className="bg-white/5 text-white/70 border-white/10">
                      {t}
                    </Badge>
                  ))}
                  {b.tags.length > 4 ? (
                    <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10">
                      +{b.tags.length - 4}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="font-mono">{b.submissions} submissions</div>
                  <div className="font-mono">Posted {formatDate(b.createdAt)}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filtered.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 p-6 rounded-xl border border-white/10 bg-card/20 text-sm text-muted-foreground">
            No bounties match your filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
