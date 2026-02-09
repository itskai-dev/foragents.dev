import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSkillVersions, type SkillVersion, type SkillVersionType } from "@/lib/skillVersions";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function labelType(t: SkillVersionType): string {
  if (t === "major") return "Major";
  if (t === "minor") return "Minor";
  return "Patch";
}

const typeBadgeClasses: Record<SkillVersionType, string> = {
  major: "bg-cyan/10 text-cyan border-cyan/30",
  minor: "bg-purple/10 text-purple border-purple/30",
  patch: "bg-green/10 text-green border-green/30",
};

const typeDotClasses: Record<SkillVersionType, string> = {
  major: "bg-cyan/15 border-cyan/30",
  minor: "bg-purple/15 border-purple/30",
  patch: "bg-green/15 border-green/30",
};

function VersionItem({ v }: { v: SkillVersion }) {
  return (
    <div className="relative pl-12">
      {/* Timeline dot */}
      <div
        className={
          "absolute left-0 top-1 w-10 h-10 rounded-full border flex items-center justify-center " +
          typeDotClasses[v.type]
        }
      >
        <div
          className={
            "w-2.5 h-2.5 rounded-full " +
            (v.type === "major" ? "bg-cyan" : v.type === "minor" ? "bg-purple" : "bg-green")
          }
        />
      </div>

      <Card className="bg-card/50 border-white/5 hover:border-cyan/20 transition-all">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <div className="font-mono text-sm text-foreground">v{v.version}</div>
              <div className="text-xs text-muted-foreground">{formatDate(v.date)}</div>
            </div>
            <Badge
              variant="outline"
              className={"text-xs whitespace-nowrap " + typeBadgeClasses[v.type]}
            >
              {labelType(v.type)}
            </Badge>
          </div>

          {v.changes.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc pl-5">
              {v.changes.map((c, idx) => (
                <li key={`${v.version}-${idx}`}>{c}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function SkillVersionHistory({ slug }: { slug: string }) {
  const versions = getSkillVersions(slug);
  if (versions.length === 0) {
    return (
      <Card className="bg-card/50 border-white/5">
        <CardContent className="p-5 text-sm text-muted-foreground">
          No version history published yet.
        </CardContent>
      </Card>
    );
  }

  const visible = versions.slice(0, 3);
  const hidden = versions.slice(3);

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-8 bottom-8 w-px bg-white/10" />

      <div className="space-y-8">
        {visible.map((v) => (
          <VersionItem key={`${slug}-${v.version}`} v={v} />
        ))}

        {hidden.length > 0 ? (
          <details className="group">
            <summary className="cursor-pointer select-none text-sm text-cyan hover:underline pl-12">
              Show {hidden.length} older version{hidden.length === 1 ? "" : "s"}
            </summary>
            <div className="mt-6 space-y-8">
              {hidden.map((v) => (
                <VersionItem key={`${slug}-${v.version}`} v={v} />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
}
