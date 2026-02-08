import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VerifiedSkillInfo } from "@/lib/verification";

type VerifiedBadgeMode = "inline" | "icon";

export function VerifiedSkillBadge({
  info,
  mode = "inline",
  className,
}: {
  info: VerifiedSkillInfo | null;
  mode?: VerifiedBadgeMode;
  className?: string;
}) {
  if (!info) return null;

  const verifiedTitle = `Verified by ${info.verifiedBy} on ${info.verifiedAt}`;

  const isMaintained = (info.badges || []).includes("maintained");
  const maintainedTitle = isMaintained
    ? `Maintained by ${info.verifiedBy} (actively monitored)`
    : "";

  if (mode === "icon") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan/20 border border-cyan/30 text-cyan text-[11px] leading-none",
          className
        )}
        title={verifiedTitle + (isMaintained ? ` • ${maintainedTitle}` : "")}
        aria-label={verifiedTitle}
      >
        ✓
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge
        className={
          "bg-gradient-to-r from-cyan/20 to-electric-blue/20 text-cyan border border-cyan/25 font-semibold px-2 py-0.5"
        }
        title={verifiedTitle}
      >
        <span aria-hidden>✓</span>
        <span>Verified</span>
      </Badge>

      {isMaintained ? (
        <Badge
          variant="outline"
          className="bg-white/5 text-white/70 border-white/10 px-2 py-0.5"
          title={maintainedTitle}
        >
          <span aria-hidden>🛠</span>
          <span>Maintained</span>
        </Badge>
      ) : null}
    </span>
  );
}
