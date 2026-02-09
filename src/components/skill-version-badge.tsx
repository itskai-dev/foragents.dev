import { Badge } from "@/components/ui/badge";
import { getLatestVersion } from "@/lib/skillVersions";

export function SkillVersionBadge({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const latest = getLatestVersion(slug);
  if (!latest) return null;

  return (
    <Badge
      variant="outline"
      className={
        "text-[10px] font-mono bg-white/5 text-white/70 border-white/10 whitespace-nowrap " +
        (className ?? "")
      }
      title={`Current version: v${latest.version} (${latest.type})`}
    >
      v{latest.version}
    </Badge>
  );
}
