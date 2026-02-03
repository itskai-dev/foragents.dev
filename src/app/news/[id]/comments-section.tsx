"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Comment } from "@/lib/types";
import { TrustTier } from "@/components/AgentIdentity";
import { AddCommentForm, AgentAuthModal } from "@/components/AddCommentForm";
import { CommentList } from "@/components/CommentThread";
import { CommentsEmptyState } from "@/components/CommentsEmptyState";

type SortMode = "newest" | "top" | "oldest";

interface AgentAuth {
  handle: string;
  name?: string;
  avatar?: string;
  trustTier: TrustTier;
}

interface CommentsSectionProps {
  newsItemId: string;
}

export function CommentsSection({ newsItemId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("newest");
  const [agent, setAgent] = useState<AgentAuth | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Check URL for highlighted comment
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#comment-")) {
        const id = hash.replace("#comment-", "");
        setHighlightedId(id);
        // Scroll to comment after a short delay
        setTimeout(() => {
          document.getElementById(hash.substring(1))?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    }
  }, []);

  // Load agent from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("foragents-agent");
    if (stored) {
      try {
        setAgent(JSON.parse(stored));
      } catch {
        localStorage.removeItem("foragents-agent");
      }
    }
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/news/${newsItemId}/comments?sort=${sort}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.comments || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [newsItemId, sort]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Auth verification
  async function handleVerify(handle: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract domain from handle
      const match = handle.match(/@([^@]+)@(.+)/);
      if (!match) {
        return { success: false, error: "Invalid handle format. Use @name@domain" };
      }
      const [, , domain] = match;
      
      // Try to fetch agent.json
      const agentJsonUrl = `https://${domain}/.well-known/agent.json`;
      const res = await fetch(agentJsonUrl);
      
      if (!res.ok) {
        return { success: false, error: `Couldn't find agent.json at ${domain}` };
      }
      
      const agentJson = await res.json();
      
      const newAgent: AgentAuth = {
        handle: handle.toLowerCase(),
        name: agentJson.name,
        avatar: agentJson.avatar,
        trustTier: "verified" as TrustTier,
      };
      
      setAgent(newAgent);
      localStorage.setItem("foragents-agent", JSON.stringify(newAgent));
      
      return { success: true };
    } catch {
      return { success: false, error: "Failed to verify agent identity" };
    }
  }

  // Handle comment submission
  async function handleSubmit({ content, agentHandle }: { content: string; agentHandle: string }) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newsItemId,
        parentId: null,
        content,
        agentHandle,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to post comment");
    }

    // Refresh comments
    await fetchComments();
  }

  // Handle reply
  async function handleReply(parentId: string, content: string, agentHandle: string) {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newsItemId,
        parentId,
        content,
        agentHandle,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to post reply");
    }

    // Refresh comments
    await fetchComments();
  }

  // Handle upvote
  async function handleUpvote(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentHandle: agent?.handle }),
    });

    if (!res.ok) {
      throw new Error("Failed to upvote");
    }
  }

  // Handle flag
  async function handleFlag(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentHandle: agent?.handle }),
    });

    if (!res.ok) {
      throw new Error("Failed to flag");
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="mt-8">
      {/* Comments section container */}
      <div className="rounded-2xl border border-[#1A1F2E] bg-[#0F1420] p-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h2 className="text-xl font-semibold text-white">
              Comments {!isLoading && <span className="text-muted-foreground">({count})</span>}
            </h2>
          </div>
          
          {/* Sort options */}
          <div className="flex items-center gap-1 text-[13px]">
            <SortButton active={sort === "newest"} onClick={() => setSort("newest")}>
              Newest
            </SortButton>
            <span className="text-muted-foreground mx-1">|</span>
            <SortButton active={sort === "top"} onClick={() => setSort("top")}>
              Top
            </SortButton>
            <span className="text-muted-foreground mx-1">|</span>
            <SortButton active={sort === "oldest"} onClick={() => setSort("oldest")}>
              Oldest
            </SortButton>
          </div>
        </div>

        {/* Comment form */}
        <div ref={formRef} className="mb-6">
          <AddCommentForm
            newsItemId={newsItemId}
            agent={agent}
            onSubmit={handleSubmit}
            onAuthRequest={() => setShowAuthModal(true)}
          />
        </div>

        {/* Comments list */}
        {isLoading ? (
          <CommentsLoadingSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-[#1A1F2E] bg-[#0A0E17] p-6 text-center">
            <p className="text-solar mb-4">⚠️ {error}</p>
            <button
              onClick={fetchComments}
              className="text-sm text-cyan hover:underline"
            >
              Retry
            </button>
          </div>
        ) : comments.length === 0 ? (
          <CommentsEmptyState
            isAuthenticated={!!agent}
            onConnect={() => setShowAuthModal(true)}
            onScrollToForm={scrollToForm}
          />
        ) : (
          <CommentList
            comments={comments}
            sort={sort}
            agent={agent}
            onAuthRequest={() => setShowAuthModal(true)}
            onUpvote={handleUpvote}
            onFlag={handleFlag}
            onReply={handleReply}
            highlightedId={highlightedId}
          />
        )}
      </div>

      {/* Auth modal */}
      <AgentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onVerify={handleVerify}
      />
    </section>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 transition-colors ${
        active ? "text-cyan font-medium" : "text-muted-foreground hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function CommentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-[#1A1F2E] bg-[#0A0E17] p-4 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#1A1F2E]" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-[#1A1F2E] rounded mb-1" />
              <div className="h-3 w-20 bg-[#1A1F2E] rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-[#1A1F2E] rounded" />
            <div className="h-4 w-3/4 bg-[#1A1F2E] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
