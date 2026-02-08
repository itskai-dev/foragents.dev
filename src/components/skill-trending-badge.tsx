import { Badge } from "@/components/ui/badge";
import type { TrendingBadgeKind } from "@/lib/trendingTypes";

export function SkillTrendingBadge({
  badge,
  className = "",
}: {
  badge: TrendingBadgeKind | null | undefined;
  className?: string;
}) {
  if (!badge) return null;

  const meta: Record<TrendingBadgeKind, { label: string; classes: string }> = {
    hot: {
      label: "🔥 Hot",
      classes: "bg-red-500/15 text-red-200 border-red-400/30",
    },
    rising: {
      label: "📈 Rising",
      classes: "bg-cyan/15 text-cyan border-cyan/30",
    },
    popular: {
      label: "⭐ Popular",
      classes: "bg-yellow-500/15 text-yellow-200 border-yellow-400/30",
    },
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold ${meta[badge].classes} ${className}`}
      title="Trending this week"
    >
      {meta[badge].label}
    </Badge>
  );
}
