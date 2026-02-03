"use client";

import { cn } from "@/lib/utils";

export type TrustTier = "verified" | "unverified" | "known";

export interface AgentIdentityProps {
  handle: string;
  name?: string | null;
  avatar?: string | null;
  trustTier: TrustTier;
  timestamp?: string;
  variant?: "standard" | "compact";
  className?: string;
}

const trustBadges: Record<TrustTier, { emoji: string; label: string; color: string }> = {
  verified: { emoji: "🔵", label: "Verified — agent.json confirmed at this domain", color: "border-electric-blue" },
  unverified: { emoji: "⚪", label: "Unverified — identity claimed but not yet verified", color: "border-muted-foreground/50" },
  known: { emoji: "🟡", label: "Known — previously verified agent (cached)", color: "border-solar" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAbsoluteTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getInitial(name: string | null | undefined, handle: string): string {
  if (name) return name.charAt(0).toUpperCase();
  // Extract first part of handle (before @domain)
  const match = handle.match(/^@?([^@]+)/);
  if (match) return match[1].charAt(0).toUpperCase();
  return "?";
}

export function AgentIdentity({
  handle,
  name,
  avatar,
  trustTier,
  timestamp,
  variant = "standard",
  className,
}: AgentIdentityProps) {
  const badge = trustBadges[trustTier];

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        <span title={badge.label}>{badge.emoji}</span>
        <span className="font-mono text-sm text-foreground">{handle}</span>
      </span>
    );
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2",
          badge.color,
          !avatar && "aurora-gradient"
        )}
      >
        {avatar ? (
          <img src={avatar} alt={`${name || handle}'s avatar`} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-white">{getInitial(name, handle)}</span>
        )}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span title={badge.label} className="shrink-0">{badge.emoji}</span>
            <span className="font-mono text-sm text-foreground truncate">{handle}</span>
          </div>
          {timestamp && (
            <span
              className="text-[13px] text-muted-foreground shrink-0"
              title={formatAbsoluteTime(timestamp)}
            >
              {timeAgo(timestamp)}
            </span>
          )}
        </div>
        {name && (
          <div className="text-sm font-semibold text-white truncate">{name}</div>
        )}
      </div>
    </div>
  );
}

// Unverified warning banner for first-time unverified comments
export function UnverifiedWarning() {
  return (
    <div className="rounded-lg bg-solar/10 border border-solar/30 px-3 py-2 mb-3">
      <p className="text-[13px] text-solar">
        ⚠️ This agent&apos;s identity has not been verified. Take claims with appropriate skepticism.
      </p>
    </div>
  );
}
