"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type RequestRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  votes: number;
};

type ListResponse = {
  requests: RequestRow[];
  total: number;
};

type SortOption = "votes" | "recent";

const CATEGORY_OPTIONS = [
  "integrations",
  "security",
  "observability",
  "testing",
  "automation",
  "productivity",
  "general",
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

type Notice = { type: "success" | "error" | "info"; message: string };

export function RequestsClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [requests, setRequests] = useState<RequestRow[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);

  const [sortBy, setSortBy] = useState<SortOption>("votes");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const totalVotes = useMemo(
    () => requests.reduce((sum, r) => sum + (typeof r.votes === "number" ? r.votes : 0), 0),
    [requests]
  );

  const availableCategories = useMemo(() => {
    const fromRequests = requests.map((r) => r.category).filter(Boolean);
    const merged = new Set(["all", ...CATEGORY_OPTIONS, ...fromRequests]);
    return Array.from(merged);
  }, [requests]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("sort", sortBy);
      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }

      const query = params.toString();
      const res = await fetch(`/api/requests${query ? `?${query}` : ""}`, { cache: "no-store" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed to load requests (${res.status})`);
      }
      const data = (await res.json()) as ListResponse;
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load requests";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sortBy, categoryFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; details?: string[] };
        const details = Array.isArray(body.details) ? body.details.join(" • ") : "";
        throw new Error(
          body.error
            ? `${body.error}${details ? `: ${details}` : ""}`
            : `Request failed (${res.status})`
        );
      }

      setNotice({ type: "success", message: "Request submitted — thanks!" });
      setTitle("");
      setDescription("");
      setCategory(CATEGORY_OPTIONS[0]);

      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to submit request";
      setError(message);
      setNotice({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  async function upvote(id: string) {
    if (votingId) return;

    setVotingId(id);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(id)}/vote`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Vote failed (${res.status})`);
      }

      const body = (await res.json()) as { votes?: number };
      const nextVotes = typeof body.votes === "number" ? body.votes : null;

      setRequests((prev) =>
        prev
          .map((r) => (r.id === id ? { ...r, votes: nextVotes ?? r.votes + 1 } : r))
          .sort((a, b) => {
            if (sortBy === "recent") {
              return b.createdAt.localeCompare(a.createdAt);
            }
            return (b.votes ?? 0) - (a.votes ?? 0) || b.createdAt.localeCompare(a.createdAt);
          })
      );

      setNotice({ type: "info", message: "Upvoted" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to upvote";
      setError(message);
      setNotice({ type: "error", message });
    } finally {
      setVotingId(null);
    }
  }

  const noticeClass =
    notice?.type === "success"
      ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/5"
      : notice?.type === "error"
        ? "text-red-400 border-red-500/20 bg-red-500/5"
        : "text-cyan border-[#06D6A0]/20 bg-[#06D6A0]/5";

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card/30 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl">Request a kit</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add a kit/integration to the community queue. Keep it concrete: what are you building and what do you need?
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Slack Actions Kit"
                    className="bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What should this kit do?"
                    className="min-h-[120px] bg-background/40 border-white/10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-background/40 px-3 py-2 text-sm"
                    required
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
                >
                  {submitting ? "Submitting…" : "Submit request"}
                </Button>

                {(error || notice) && (
                  <div className={`text-sm border rounded-lg p-3 ${noticeClass}`}>
                    {notice?.message || error}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Submissions are public. Don&apos;t include secrets.
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-gradient-to-br from-[#06D6A0]/5 via-card/60 to-purple/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Live community queue</div>
                <div className="text-xs text-muted-foreground">Upvotes help prioritize what we build next.</div>
              </div>
              <Badge
                variant="outline"
                className="border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10"
              >
                {totalVotes} votes
              </Badge>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Community requests</h2>
              <p className="text-sm text-muted-foreground">
                Sorted by {sortBy === "votes" ? "upvotes" : "newest"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-md border border-white/10 bg-background/40 px-2.5 py-1.5 text-xs"
              >
                <option value="votes">Most voted</option>
                <option value="recent">Most recent</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-white/10 bg-background/40 px-2.5 py-1.5 text-xs"
              >
                {availableCategories.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All categories" : option}
                  </option>
                ))}
              </select>

              <div className="text-sm text-muted-foreground font-mono">{requests.length} items</div>
            </div>
          </div>

          <Separator className="opacity-10 mb-6" />

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="p-6 rounded-xl border border-white/10 bg-card/20">
              <div className="text-sm text-muted-foreground">No requests yet. Be the first.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <Card
                  key={r.id}
                  className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-white/90 truncate">{r.title}</CardTitle>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10">
                            {formatDate(r.createdAt)}
                          </Badge>
                          <Badge variant="outline" className="bg-purple/10 text-purple border-purple/30">
                            {r.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className="bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/30"
                        >
                          {r.votes} upvotes
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void upvote(r.id)}
                          disabled={votingId === r.id}
                          className="border-white/10 bg-background/40 hover:bg-white/5"
                        >
                          {votingId === r.id ? "Voting…" : "Upvote"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-white/50 mb-1">Description</div>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{r.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
