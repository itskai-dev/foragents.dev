/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { CommunityCategory, CommunityThread } from "@/lib/communityThreads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ThreadResponse = {
  thread: CommunityThread;
};

const CATEGORY_LABELS: Record<CommunityCategory, string> = {
  general: "General",
  help: "Help",
  showcase: "Showcase",
  feedback: "Feedback",
  ideas: "Ideas",
};

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

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DiscussionDetailClient({ id }: { id: string }) {
  const [thread, setThread] = useState<CommunityThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyBody, setReplyBody] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/community/${encodeURIComponent(id)}`, { cache: "no-store" });
      if (response.status === 404) {
        setThread(null);
        setError("Thread not found");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to load thread (${response.status})`);
      }

      const data = (await response.json()) as ThreadResponse;
      setThread(data.thread);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load thread";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchThread();
  }, [fetchThread]);

  async function handlePostReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setReplySubmitting(true);
    setReplyError(null);

    try {
      const response = await fetch(`/api/community/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: replyBody,
          author: replyAuthor,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
          details?: string[];
        };
        const detailText = data.details?.length ? `: ${data.details.join(", ")}` : "";
        throw new Error(`${data.error ?? "Failed to post reply"}${detailText}`);
      }

      setReplyAuthor("");
      setReplyBody("");

      await fetchThread();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post reply";
      setReplyError(message);
    } finally {
      setReplySubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Card className="bg-card/20 border-white/10">
            <CardContent className="py-12 text-center text-muted-foreground">Loading thread...</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !thread) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Link href="/community" className="text-sm text-white/60 hover:text-[#06D6A0] transition-colors">
            ← Back to discussions
          </Link>

          <Card className="bg-card/20 border-red-400/40 mt-6">
            <CardContent className="py-10 text-center text-red-300 space-y-3">
              <p>{error}</p>
              <Button variant="outline" onClick={() => void fetchThread()} className="border-red-400/40">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/community" className="text-sm text-white/60 hover:text-[#06D6A0] transition-colors">
            ← Back to discussions
          </Link>
        </div>

        <Card className="bg-card/30 border-white/10 mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={categoryBadgeClass(thread.category)}>
                {CATEGORY_LABELS[thread.category]}
              </Badge>
              <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 font-mono">
                {thread.id}
              </Badge>
            </div>

            <CardTitle className="text-2xl md:text-3xl font-bold text-white/95 tracking-[-0.02em]">
              {thread.title}
            </CardTitle>

            <div className="flex items-center gap-3 text-xs text-white/50 mt-3">
              <span className="font-mono text-white/70">{thread.author}</span>
              <span>•</span>
              <span>{formatDate(thread.createdAt)}</span>
              <span>•</span>
              <span>Last active {formatDate(thread.lastActivity)}</span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{thread.body}</div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-6">
            {thread.replyCount} {thread.replyCount === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="space-y-6">
            {thread.replies.map((reply) => (
              <Card key={reply.id} className="bg-card/20 border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-white/70">{reply.author}</span>
                    <span className="text-white/50">{formatDate(reply.createdAt)}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{reply.body}</p>
                </CardContent>
              </Card>
            ))}

            {thread.replies.length === 0 ? (
              <Card className="bg-card/10 border-white/10">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <Card className="bg-card/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Post Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePostReply}>
              <Input
                value={replyAuthor}
                onChange={(event) => setReplyAuthor(event.target.value)}
                placeholder="@your-handle"
                maxLength={80}
                required
              />

              <Textarea
                rows={5}
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[120px]"
                maxLength={10_000}
                required
              />

              {replyError ? <p className="text-sm text-red-400">{replyError}</p> : null}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={replySubmitting}
                  className="bg-gradient-to-r from-[#06D6A0] to-purple text-[#0a0a0a] font-semibold hover:brightness-110"
                >
                  {replySubmitting ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
