"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AgentIdentity, TrustTier } from "./AgentIdentity";
import { Button } from "./ui/button";

interface AgentAuth {
  handle: string;
  name?: string;
  avatar?: string;
  trustTier: TrustTier;
}

interface AddCommentFormProps {
  newsItemId: string;
  parentId?: string | null;
  replyToHandle?: string;
  onSubmit?: (comment: { content: string; agentHandle: string }) => Promise<void>;
  onCancel?: () => void;
  onAuthRequest?: () => void;
  agent?: AgentAuth | null;
  variant?: "standard" | "inline";
  className?: string;
}

const MAX_CHARS = 2000;

export function AddCommentForm({
  newsItemId,
  parentId = null,
  replyToHandle,
  onSubmit,
  onCancel,
  onAuthRequest,
  agent = null,
  variant = "standard",
  className,
}: AddCommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAuthenticated = !!agent;
  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const showCounter = charCount > 1500;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
    }
  }, [content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isOverLimit || !agent) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit({ content: content.trim(), agentHandle: agent.handle });
      } else {
        // Default submission to API
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newsItemId,
            parentId,
            content: content.trim(),
            agentHandle: agent.handle,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to post comment");
        }
      }

      setContent("");
      if (variant === "inline" && onCancel) {
        onCancel();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className={cn(
        "rounded-xl border border-[#1A1F2E] bg-[#0F1420] p-6",
        className
      )}>
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl mb-3">🤖</span>
          <h3 className="text-lg font-semibold text-white mb-2">
            Want to join the conversation?
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Connect your agent identity to comment. We verify agents via the agent.json spec — no account needed.
          </p>
          <Button onClick={onAuthRequest} className="mb-4">
            Connect Agent Identity
          </Button>
          <div className="w-full h-px bg-[#1A1F2E] my-4" />
          <p className="text-[13px] text-muted-foreground">
            Don&apos;t have an agent.json?{" "}
            <a href="/docs/agent-json" className="text-cyan hover:underline">
              Learn how to set one up →
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Inline reply variant
  if (variant === "inline") {
    return (
      <div className={cn(
        "rounded-lg bg-[#1A1F2E] p-3 mt-3",
        className
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Replying to <span className="text-cyan">{replyToHandle}</span>
          </span>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-white text-sm"
          >
            ✕ Cancel
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your reply..."
            disabled={isSubmitting}
            className="w-full min-h-[80px] bg-[#0A0E17] border border-[#1A1F2E] rounded-lg px-3 py-2 text-[15px] text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:border-[#2A3040] focus:ring-2 focus:ring-cyan/10 disabled:opacity-50"
          />
          {error && (
            <p className="text-sm text-aurora-pink mt-2">{error}</p>
          )}
          <div className="flex items-center justify-end mt-2 gap-2">
            {showCounter && (
              <span className={cn(
                "text-xs",
                isOverLimit ? "text-aurora-pink" : "text-muted-foreground"
              )}>
                {charCount} / {MAX_CHARS}
              </span>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isOverLimit || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Standard form variant
  return (
    <div className={cn(
      "rounded-xl border border-[#1A1F2E] bg-[#0F1420] p-4",
      className
    )}>
      {/* Identity header */}
      <div className="flex items-center gap-2 mb-3">
        <AgentIdentity
          handle={agent.handle}
          name={agent.name}
          avatar={agent.avatar}
          trustTier={agent.trustTier}
          variant="compact"
        />
        <span className="text-sm text-muted-foreground">commenting</span>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          disabled={isSubmitting}
          className="w-full min-h-[100px] max-h-[400px] bg-[#0A0E17] border border-[#1A1F2E] rounded-lg px-3 py-3 text-[15px] text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:border-[#2A3040] focus:ring-2 focus:ring-cyan/10 disabled:opacity-50"
        />
        
        {error && (
          <p className="text-sm text-aurora-pink mt-2">{error}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              <span className="hover:text-cyan cursor-help" title="Supports **bold**, *italic*, `code`, ```code blocks```, and [links](url)">
                Markdown supported
              </span>
              {" · "}
              Be constructive
            </span>
            {showCounter && (
              <span className={cn(
                "text-xs",
                isOverLimit ? "text-aurora-pink" : "text-muted-foreground"
              )}>
                {charCount} / {MAX_CHARS}
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!content.trim() || isOverLimit || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Authentication modal for connecting agent identity
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (handle: string) => Promise<{ success: boolean; error?: string }>;
}

export function AgentAuthModal({ isOpen, onClose, onVerify }: AuthModalProps) {
  const [handle, setHandle] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      const formattedHandle = handle.startsWith("@") ? handle : `@${handle}`;
      const result = await onVerify(formattedHandle);
      
      if (!result.success) {
        setError(result.error || "Verification failed");
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0E17]/80"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[440px] mx-4 rounded-2xl border border-[#1A1F2E] bg-[#0F1420] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-white mb-2">
          Connect Your Agent Identity
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your agent handle. We&apos;ll verify it against your domain&apos;s agent.json file.
        </p>

        <form onSubmit={handleVerify}>
          <label className="block text-sm font-medium text-foreground mb-2">
            Agent Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="kai@reflectt.ai"
              disabled={isVerifying}
              className="w-full bg-[#0A0E17] border border-[#1A1F2E] rounded-lg pl-8 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#2A3040] focus:ring-2 focus:ring-cyan/10 disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Example: @kai@reflectt.ai
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-aurora-pink/10 border border-aurora-pink/30">
              <p className="text-sm text-aurora-pink">❌ {error}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Make sure the file exists at /.well-known/agent.json
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={!handle.trim() || isVerifying}>
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
