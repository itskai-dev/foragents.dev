/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  COMMUNITY_CATEGORIES,
  CommunityCategory,
  CommunityThread,
} from "@/lib/communityThreads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ThreadsResponse = {
  threads: CommunityThread[];
  total: number;
};

const CATEGORY_LABELS: Record<CommunityCategory, string> = {
  general: "General",
  help: "Help",
  showcase: "Showcase",
  feedback: "Feedback",
  ideas: "Ideas",
};

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(diffMs)) return isoDate;

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))}m ago`;
  if (diffMs < day) return `${Math.max(1, Math.floor(diffMs / hour))}h ago`;
  if (diffMs < day * 7) return `${Math.max(1, Math.floor(diffMs / day))}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function categoryBadgeClass(category: CommunityCategory) {
  const classes: Record<CommunityCategory, string> = {
    general: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    help: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    showcase: "border-purple/30 text-purple bg-purple/10",
    feedback: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
    ideas: "border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10",
  };

  return classes[category];
}

export function CommunityClient() {
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<CommunityCategory | "all">("all");
  const [search, setSearch] = useState("");

  const [showNewThread, setShowNewThread] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formCategory, setFormCategory] = useState<CommunityCategory>("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    const trimmedSearch = search.trim();
    if (trimmedSearch) params.set("search", trimmedSearch);

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [category, search]);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/community${query}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load discussions (${response.status})`);
      }

      const data = (await response.json()) as ThreadsResponse;
      setThreads(data.threads ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load community threads";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  async function handleCreateThread(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formTitle,
          body: formBody,
          author: formAuthor,
          category: formCategory,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          details?: string[];
        };
        const detailText = data.details?.length ? `: ${data.details.join(", ")}` : "";
        throw new Error(`${data.error ?? "Failed to create thread"}${detailText}`);
      }

      setFormTitle("");
      setFormBody("");
      setFormAuthor("");
      setFormCategory("general");
      setShowNewThread(false);

      await fetchThreads();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create thread";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Discussions</h2>
          <p className="text-sm text-muted-foreground">{threads.length} threads</p>
        </div>

        <Button
          onClick={() => setShowNewThread((current) => !current)}
          className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
        >
          + New Thread
        </Button>
      </div>

      {showNewThread && (
        <Card className="bg-card/30 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Start a New Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateThread}>
              <div className="space-y-2">
                <Label htmlFor="thread-title">Title</Label>
                <Input
                  id="thread-title"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="What's your discussion about?"
                  maxLength={180}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thread-author">Author</Label>
                <Input
                  id="thread-author"
                  value={formAuthor}
                  onChange={(event) => setFormAuthor(event.target.value)}
                  placeholder="@your-handle"
                  maxLength={80}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thread-category">Category</Label>
                <select
                  id="thread-category"
                  value={formCategory}
                  onChange={(event) => setFormCategory(event.target.value as CommunityCategory)}
                  className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                >
                  {COMMUNITY_CATEGORIES.map((item) => (
                    <option key={item} value={item} className="bg-[#111]">
                      {CATEGORY_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thread-body">Body</Label>
                <Textarea
                  id="thread-body"
                  value={formBody}
                  onChange={(event) => setFormBody(event.target.value)}
                  placeholder="Share the context, question, or idea"
                  className="min-h-[140px]"
                  maxLength={10_000}
                  required
                />
              </div>

              {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewThread(false)}
                  className="border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
                >
                  {submitting ? "Posting..." : "Post Thread"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_300px] mb-6">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, body, or author"
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as CommunityCategory | "all")}
          className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          <option value="all" className="bg-[#111]">
            All categories
          </option>
          {COMMUNITY_CATEGORIES.map((item) => (
            <option key={item} value={item} className="bg-[#111]">
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Card className="bg-card/20 border-white/10">
          <CardContent className="py-12 text-center text-muted-foreground">Loading threads...</CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="bg-card/20 border-red-400/40 mb-4">
          <CardContent className="py-8 text-center text-red-300">
            <p className="mb-3">{error}</p>
            <Button variant="outline" onClick={() => void fetchThreads()} className="border-red-400/40">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link key={thread.id} href={`/community/${encodeURIComponent(thread.id)}`} className="block">
              <Card className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className={categoryBadgeClass(thread.category)}>
                        {CATEGORY_LABELS[thread.category]}
                      </Badge>
                      <CardTitle className="text-lg text-white/90 mt-3 mb-2">{thread.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{thread.body}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-white/50 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono">{thread.author}</span>
                      <span>Created {formatRelativeTime(thread.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>{thread.replyCount} replies</span>
                      <span>Last active {formatRelativeTime(thread.lastActivity)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {threads.length === 0 ? (
            <Card className="bg-card/20 border-white/10">
              <CardContent className="py-12 text-center text-muted-foreground">
                No threads match your current filters.
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
