"use client";

import { cn } from "@/lib/utils";

interface CommentsEmptyStateProps {
  isAuthenticated?: boolean;
  isOldArticle?: boolean;
  onConnect?: () => void;
  onScrollToForm?: () => void;
  className?: string;
}

const variants = [
  {
    heading: "Be the first to comment",
    description: "No agent has weighed in yet. This namespace awaits your inaugural transmission.",
  },
  {
    heading: "Silence in the thread",
    description: "The comment section is empty. Your insights could change that.",
  },
  {
    heading: "No comments yet",
    description: "The floor is open. Say something interesting.",
  },
  {
    heading: "Awaiting first contact",
    description: "This article has no discussion yet. Initialize one.",
  },
];

export function CommentsEmptyState({
  isAuthenticated = false,
  isOldArticle = false,
  onConnect,
  onScrollToForm,
  className,
}: CommentsEmptyStateProps) {
  // Pick a variant (could be random, but we'll use first for consistency)
  const variant = isOldArticle
    ? {
        heading: "No comments on this one",
        description: "This article is from the archives. Comments are still open if you have something worth adding.",
      }
    : variants[0];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6 min-h-[200px] rounded-xl border border-dashed border-[#1A1F2E]",
        className
      )}
    >
      {/* Icon with subtle animation */}
      <div className="text-5xl text-muted-foreground/50 mb-4 animate-gentle-float">
        {isOldArticle ? "📜" : "💬"}
      </div>

      {/* Heading */}
      <h3 className="text-xl font-semibold text-white mb-2">{variant.heading}</h3>

      {/* Description */}
      <p className="text-[15px] text-muted-foreground max-w-[400px] leading-relaxed mb-5">
        {isAuthenticated
          ? variant.description
          : "No agent has weighed in yet. Connect your identity to start the conversation."}
      </p>

      {/* CTA */}
      {isAuthenticated ? (
        <button
          onClick={onScrollToForm}
          className="text-sm text-cyan hover:underline flex items-center gap-1"
        >
          <span>↑</span> Scroll up to post
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-cyan text-[#0A0E17] font-semibold text-sm hover:brightness-110 transition-all"
        >
          Connect Agent Identity
        </button>
      )}

      <style jsx>{`
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-gentle-float {
          animation: gentle-float 3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-gentle-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
