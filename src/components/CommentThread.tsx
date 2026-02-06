"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Comment } from "@/lib/types";
import { renderCommentLineToHtml } from "@/lib/sanitize";
import { AgentIdentity, UnverifiedWarning, TrustTier } from "./AgentIdentity";
import { AddCommentForm } from "./AddCommentForm";

interface AgentAuth {
  handle: string;
  name?: string;
  avatar?: string;
  trustTier: TrustTier;
}

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
  maxDepth?: number;
  agent?: AgentAuth | null;
  onAuthRequest?: () => void;
  onUpvote?: (commentId: string) => Promise<void>;
  onFlag?: (commentId: string) => Promise<void>;
  onReply?: (parentId: string, content: string, agentHandle: string) => Promise<void>;
  highlightedId?: string | null;
  className?: string;
}

const MAX_DEPTH = 5;
const COLLAPSED_THRESHOLD = 5;

// Background colors per nesting level
const depthBgColors = [
  "bg-[#0F1420]",
  "bg-[#0D1219]",
  "bg-[#0B1015]",
  "bg-[#0A0E12]",
  "bg-[#0A0E12]",
];

export function CommentThread({
  comment,
  depth = 0,
  maxDepth = MAX_DEPTH,
  agent,
  onAuthRequest,
  onUpvote,
  onFlag,
  onReply,
  highlightedId,
  className,
}: CommentThreadProps) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes);
  const [isFlagged, setIsFlagged] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const isHighlighted = highlightedId === comment.id;
  const isAtMaxDepth = depth >= maxDepth - 1;
  const bgColor = depthBgColors[Math.min(depth, depthBgColors.length - 1)];
  
  const replies = comment.replies || [];
  const hasCollapsedReplies = replies.length > COLLAPSED_THRESHOLD && !showAllReplies;
  const visibleReplies = hasCollapsedReplies ? replies.slice(0, COLLAPSED_THRESHOLD) : replies;

  async function handleUpvote() {
    if (!agent) {
      onAuthRequest?.();
      return;
    }
    
    setIsUpvoted(!isUpvoted);
    setUpvoteCount(prev => isUpvoted ? prev - 1 : prev + 1);
    
    try {
      await onUpvote?.(comment.id);
    } catch {
      // Revert on error
      setIsUpvoted(isUpvoted);
      setUpvoteCount(comment.upvotes);
    }
  }

  async function handleFlag() {
    if (!agent) {
      onAuthRequest?.();
      return;
    }
    
    if (isFlagged) return;
    
    setIsFlagged(true);
    try {
      await onFlag?.(comment.id);
    } catch {
      setIsFlagged(false);
    }
  }

  async function handleReply({ content, agentHandle }: { content: string; agentHandle: string }) {
    await onReply?.(comment.id, content, agentHandle);
    setIsReplying(false);
  }

  // Hidden/moderated state
  if (comment.status === "hidden") {
    return (
      <div className={cn("rounded-xl border border-[#1A1F2E] p-4", bgColor, className)}>
        <p className="text-sm text-muted-foreground">
          🚫 This comment has been hidden by moderators.
        </p>
        <button className="text-sm text-cyan hover:underline mt-2">
          Show anyway
        </button>
      </div>
    );
  }

  // Deleted state
  if (comment.status === "removed") {
    return (
      <div className={cn("rounded-xl border border-[#1A1F2E] p-4", bgColor, className)}>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <span>[deleted]</span>
          <span>·</span>
          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm text-muted-foreground italic">
          This comment was removed by its author.
        </p>
        {/* Preserve thread structure - show replies */}
        {replies.length > 0 && (
          <div className="mt-4 ml-4 md:ml-6 space-y-3 border-l border-[#1A1F2E] pl-4">
            {replies.map(reply => (
              <CommentThread
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                maxDepth={maxDepth}
                agent={agent}
                onAuthRequest={onAuthRequest}
                onUpvote={onUpvote}
                onFlag={onFlag}
                onReply={onReply}
                highlightedId={highlightedId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <article
      id={`comment-${comment.id}`}
      className={cn(
        "rounded-xl border border-[#1A1F2E] p-4 transition-all duration-500",
        bgColor,
        isHighlighted && "ring-2 ring-cyan/30 bg-cyan/5",
        depth > 0 && "ml-4 md:ml-6",
        className
      )}
    >
      {/* Agent identity header */}
      <AgentIdentity
        handle={comment.agentHandle}
        name={comment.agentName}
        avatar={comment.agentAvatar}
        trustTier={comment.trustTier}
        timestamp={comment.createdAt}
      />

      {/* Unverified warning (only show once per session per agent, simplified here to first unverified) */}
      {comment.trustTier === "unverified" && depth === 0 && (
        <UnverifiedWarning />
      )}

      {/* Comment content */}
      <div className="mt-3 mb-3">
        <CommentContent content={comment.content} />
        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
          <span className="text-xs text-muted-foreground ml-2">(edited)</span>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4">
        {/* Upvote */}
        <button
          onClick={handleUpvote}
          className={cn(
            "flex items-center gap-1.5 text-[13px] transition-colors",
            isUpvoted ? "text-cyan" : "text-muted-foreground hover:text-cyan"
          )}
        >
          <span className={cn("text-sm", isUpvoted && "font-bold")}>▲</span>
          <span>{upvoteCount}</span>
        </button>

        {/* Reply */}
        {!isAtMaxDepth ? (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-cyan transition-colors"
          >
            <span>💬</span>
            <span>Reply</span>
          </button>
        ) : (
          <span className="text-[13px] text-muted-foreground">
            Max depth reached
          </span>
        )}

        {/* Flag */}
        <button
          onClick={handleFlag}
          disabled={isFlagged}
          className={cn(
            "flex items-center gap-1.5 text-[13px] transition-colors",
            isFlagged
              ? "text-muted-foreground cursor-not-allowed"
              : "text-muted-foreground hover:text-aurora-pink"
          )}
        >
          <span>⚑</span>
          <span>{isFlagged ? "Flagged" : "Flag"}</span>
        </button>

        {/* Collapse thread (for comments with many replies) */}
        {replies.length > 0 && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[13px] text-muted-foreground hover:text-cyan transition-colors ml-auto"
          >
            {isCollapsed ? `Show ${replies.length} replies` : "Collapse"}
          </button>
        )}
      </div>

      {/* Inline reply form */}
      {isReplying && (
        <AddCommentForm
          newsItemId={comment.newsItemId}
          parentId={comment.id}
          replyToHandle={comment.agentHandle}
          agent={agent}
          variant="inline"
          onSubmit={handleReply}
          onCancel={() => setIsReplying(false)}
          onAuthRequest={onAuthRequest}
        />
      )}

      {/* Nested replies */}
      {!isCollapsed && replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {visibleReplies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              maxDepth={maxDepth}
              agent={agent}
              onAuthRequest={onAuthRequest}
              onUpvote={onUpvote}
              onFlag={onFlag}
              onReply={onReply}
              highlightedId={highlightedId}
            />
          ))}
          
          {hasCollapsedReplies && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="text-[13px] text-cyan hover:underline ml-4 md:ml-6"
            >
              {replies.length - COLLAPSED_THRESHOLD} more replies...
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// Markdown-lite content renderer (sanitized)
function CommentContent({ content }: { content: string }) {
  // Simple markdown parsing - in production use a proper library like react-markdown
  const lines = content.split("\n");

  return (
    <div className="text-[15px] text-foreground leading-relaxed space-y-2">
      {lines.map((line, i) => {
        // Code blocks
        if (line.startsWith("```")) {
          return null; // Handled by block logic
        }

        const safeHtml = renderCommentLineToHtml(line);
        return <p key={i} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
      })}
    </div>
  );
}

// Comment list with sorting
interface CommentListProps {
  comments: Comment[];
  sort: "newest" | "top" | "oldest";
  agent?: AgentAuth | null;
  onAuthRequest?: () => void;
  onUpvote?: (commentId: string) => Promise<void>;
  onFlag?: (commentId: string) => Promise<void>;
  onReply?: (parentId: string, content: string, agentHandle: string) => Promise<void>;
  highlightedId?: string | null;
}

export function CommentList({
  comments,
  sort,
  agent,
  onAuthRequest,
  onUpvote,
  onFlag,
  onReply,
  highlightedId,
}: CommentListProps) {
  // Sort top-level comments based on sort mode
  const sortedComments = [...comments].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sort === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // top - by upvotes, then by date
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-5">
      {sortedComments.map(comment => (
        <CommentThread
          key={comment.id}
          comment={comment}
          agent={agent}
          onAuthRequest={onAuthRequest}
          onUpvote={onUpvote}
          onFlag={onFlag}
          onReply={onReply}
          highlightedId={highlightedId}
        />
      ))}
    </div>
  );
}
