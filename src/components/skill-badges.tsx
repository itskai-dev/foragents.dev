"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/lib/badges";

export type SkillBadgesMode = "compact" | "full";

export function SkillBadges({
  badges,
  mode = "compact",
  className,
}: {
  badges: BadgeDefinition[];
  mode?: SkillBadgesMode;
  className?: string;
}) {
  if (!badges || badges.length === 0) return null;

  if (mode === "compact") {
    return (
      <div className={cn("flex items-center gap-1.5", className)} aria-label="Skill badges">
        {badges.map((b) => (
          <span
            key={b.id}
            className="inline-flex items-center justify-center"
            title={`${b.name} — ${b.description}`}
            aria-label={`${b.name}: ${b.description}`}
          >
            <span className="text-base leading-none">{b.emoji}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Skill badges">
      {badges.map((b) => (
        <Badge
          key={b.id}
          variant="outline"
          className="bg-white/5 text-white/80 border-white/10 px-2 py-0.5"
          title={`${b.name} — ${b.description}`}
        >
          <span aria-hidden className="mr-1">{b.emoji}</span>
          <span>{b.name}</span>
        </Badge>
      ))}
    </div>
  );
}
