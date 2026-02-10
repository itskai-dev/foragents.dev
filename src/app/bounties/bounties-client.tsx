"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Bounty, BountyStatus } from "@/lib/bounties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SortKey = "recent" | "budget";

type ApiResponse = {
  bounties: Bounty[];
  total: number;
};

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
  const [sort, setSort] = useState<SortKey>("recent");
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");

  const [bounties, setBounties] = useState<Bounty[]>(initialBounties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBudget, setCreateBudget] = useState("");
  const [createTags, setCreateTags] = useState("");
  const [createRequirements, setCreateRequirements] = useState("");

  const [claimTarget, setClaimTarget] = useState<Bounty | null>(null);
  const [claimant, setClaimant] = useState("");
  const [claimMessage, setClaimMessage] = useState("");

  const refreshBounties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (tag !== "all") params.set("tag", tag);
      params.set("sort", sort);

      const res = await fetch(`/api/bounties?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load bounties");
      }

      const data = (await res.json()) as ApiResponse;
      setBounties(data.bounties);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Could not load bounties right now.");
    } finally {
      setLoading(false);
    }
  }, [sort, status, tag]);

  useEffect(() => {
    void refreshBounties();
  }, [refreshBounties]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const b of initialBounties) {
      for (const t of b.tags) tags.add(t);
    }
    for (const b of bounties) {
      for (const t of b.tags) tags.add(t);
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [initialBounties, bounties]);

  const filtered = useMemo(() => {
    const min = minBudget.trim() === "" ? null : Number(minBudget);
    const max = maxBudget.trim() === "" ? null : Number(maxBudget);

    let items = bounties.slice();

    if (min !== null && Number.isFinite(min)) {
      items = items.filter((b) => b.budget >= min);
    }

    if (max !== null && Number.isFinite(max)) {
      items = items.filter((b) => b.budget <= max);
    }

    return items;
  }, [bounties, maxBudget, minBudget]);

  async function onCreateBounty(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const tags = createTags
      .split(",")
      .map((tagItem) => tagItem.trim())
      .filter(Boolean);

    const requirements = createRequirements
      .split("\n")
      .map((requirement) => requirement.trim())
      .filter(Boolean);

    const payload = {
      title: createTitle.trim(),
      description: createDescription.trim(),
      budget: Number(createBudget),
      tags,
      requirements,
    };

    const res = await fetch("/api/bounties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({ error: "Failed to create bounty" }))) as {
        error?: string;
        details?: string[];
      };
      setError(data.details?.join(", ") || data.error || "Failed to create bounty");
      return;
    }

    setCreateTitle("");
    setCreateDescription("");
    setCreateBudget("");
    setCreateTags("");
    setCreateRequirements("");
    setShowCreateForm(false);

    await refreshBounties();
  }

  async function onClaimBounty(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!claimTarget) return;

    setError("");

    const res = await fetch(`/api/bounties/${encodeURIComponent(claimTarget.id)}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claimant: claimant.trim(),
        message: claimMessage.trim(),
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({ error: "Failed to claim bounty" }))) as {
        error?: string;
        details?: string[];
      };
      setError(data.details?.join(", ") || data.error || "Failed to claim bounty");
      return;
    }

    setClaimant("");
    setClaimMessage("");
    setClaimTarget(null);

    await refreshBounties();
  }

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
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
        >
          {showCreateForm ? "Cancel" : "Create Bounty"}
        </Button>
      </div>

      {showCreateForm ? (
        <form onSubmit={onCreateBounty} className="mb-6 p-4 rounded-xl border border-white/10 bg-card/20 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">Title</label>
              <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-white/60">Budget (USD)</label>
              <Input
                type="number"
                min="1"
                value={createBudget}
                onChange={(e) => setCreateBudget(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60">Description</label>
            <Textarea value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs text-white/60">Tags (comma-separated)</label>
            <Input
              value={createTags}
              onChange={(e) => setCreateTags(e.target.value)}
              placeholder="automation, github"
              required
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Requirements (one per line)</label>
            <Textarea
              value={createRequirements}
              onChange={(e) => setCreateRequirements(e.target.value)}
              placeholder="Must include docs\nMust include tests"
              required
            />
          </div>

          <Button type="submit" className="bg-[#06D6A0] text-[#0a0a0a] hover:brightness-110 font-semibold">
            Submit bounty
          </Button>
        </form>
      ) : null}

      {claimTarget ? (
        <form onSubmit={onClaimBounty} className="mb-6 p-4 rounded-xl border border-purple/25 bg-purple/10 space-y-3">
          <div className="text-sm text-white/90">
            Claiming: <span className="font-mono">{claimTarget.id}</span> — {claimTarget.title}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60">Your handle</label>
              <Input value={claimant} onChange={(e) => setClaimant(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-white/60">Message</label>
              <Input value={claimMessage} onChange={(e) => setClaimMessage(e.target.value)} required />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-purple text-white hover:brightness-110">
              Confirm claim
            </Button>
            <Button type="button" variant="outline" onClick={() => setClaimTarget(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

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
            <option value="recent">Most recent</option>
            <option value="budget">Highest bounty</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="font-mono">{filtered.length} bounties</div>
        <div className="hidden md:block">Tip: click a bounty title to view details</div>
      </div>

      {loading ? <div className="mt-4 text-sm text-white/60">Loading bounties…</div> : null}
      {error ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b) => (
          <Card key={b.id} className="bg-card/30 border-white/10 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-lg text-white/90 truncate">
                    <Link href={`/bounties/${encodeURIComponent(b.id)}`} className="hover:text-[#06D6A0] transition-colors">
                      {b.title}
                    </Link>
                  </CardTitle>
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

              <div className="flex gap-2">
                <Button asChild variant="outline" className="border-white/20">
                  <Link href={`/bounties/${encodeURIComponent(b.id)}`}>View</Link>
                </Button>
                {b.status === "open" ? (
                  <Button onClick={() => setClaimTarget(b)} className="bg-purple text-white hover:brightness-110">
                    Claim
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
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
