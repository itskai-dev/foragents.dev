"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Discussion, DiscussionCategory } from "@/lib/discussions";
import { DISCUSSION_CATEGORIES } from "@/lib/discussions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortKey = "latest" | "replies" | "upvotes";

function formatDate(isoStr: string) {
  try {
    const date = new Date(isoStr);
    const now = Date.now();
    const diff = now - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoStr;
  }
}

function categoryBadgeClass(category: DiscussionCategory) {
  const classes: Record<DiscussionCategory, string> = {
    "General": "border-blue-500/30 text-blue-400 bg-blue-500/10",
    "Help & Support": "border-amber-500/30 text-amber-400 bg-amber-500/10",
    "Show & Tell": "border-purple/30 text-purple bg-purple/10",
    "Feature Requests": "border-[#06D6A0]/30 text-[#06D6A0] bg-[#06D6A0]/10",
    "Bug Reports": "border-red-500/30 text-red-400 bg-red-500/10",
    "Integrations": "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  };
  return classes[category] || "border-white/10 text-white/70 bg-white/5";
}

export function CommunityClient({ initialDiscussions }: { initialDiscussions: Discussion[] }) {
  const [category, setCategory] = useState<DiscussionCategory | "all">("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);

  const filtered = useMemo(() => {
    let items = initialDiscussions.slice();

    if (category !== "all") {
      items = items.filter((d) => d.category === category);
    }

    items.sort((a, b) => {
      switch (sort) {
        case "replies":
          return b.replyCount - a.replyCount || new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case "upvotes":
          return b.upvotes - a.upvotes || new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case "latest":
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });

    return items;
  }, [initialDiscussions, category, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Discussions</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "thread" : "threads"}
          </p>
        </div>

        <Button
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
        >
          + New Discussion
        </Button>
      </div>

      {/* New Discussion Form */}
      {showNewDiscussion && (
        <Card className="bg-card/30 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Start a New Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-white/60 block mb-2">Title</label>
              <input
                type="text"
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 rounded-lg bg-background/40 border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40"
              />
            </div>

            <div>
              <label className="text-sm text-white/60 block mb-2">Category</label>
              <select
                className="w-full px-4 py-3 rounded-lg bg-background/40 border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40"
              >
                {DISCUSSION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/60 block mb-2">Description (Markdown supported)</label>
              <textarea
                rows={6}
                placeholder="Share your thoughts, questions, or ideas..."
                className="w-full px-4 py-3 rounded-lg bg-background/40 border border-white/10 text-foreground focus:outline-none focus:border-[#06D6A0]/40 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNewDiscussion(false)}
                className="border-white/10 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110">
                Post Discussion
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: This is a demo UI. In production, this would submit to an API endpoint.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            category === "all"
              ? "bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30"
              : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          }`}
        >
          All
        </button>
        {DISCUSSION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? "bg-[#06D6A0]/10 text-[#06D6A0] border border-[#06D6A0]/30"
                : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="text-sm text-muted-foreground">
          Sort by:
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSort("latest")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sort === "latest"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setSort("replies")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sort === "replies"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Most Replies
          </button>
          <button
            onClick={() => setSort("upvotes")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sort === "upvotes"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Most Upvoted
          </button>
        </div>
      </div>

      {/* Discussion List */}
      <div className="space-y-4">
        {filtered.map((discussion) => (
          <Link key={discussion.id} href={`/community/${encodeURIComponent(discussion.id)}`} className="block">
            <Card className="bg-card/30 border-white/10 hover:border-[#06D6A0]/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={categoryBadgeClass(discussion.category)}>
                        {discussion.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white/90 mb-2">
                      {discussion.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {discussion.content}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-white/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="text-sm font-medium">{discussion.upvotes}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center gap-4">
                    <span className="font-mono">{discussion.author}</span>
                    <span>{formatDate(discussion.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {discussion.replyCount}
                    </span>
                    <span>Last active {formatDate(discussion.lastActivity)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filtered.length === 0 && (
          <Card className="bg-card/20 border-white/10">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No discussions found in this category.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
