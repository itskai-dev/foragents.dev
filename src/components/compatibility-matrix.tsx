import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import compatibilityData from "@/data/compatibility.json";
import { getSkillBySlug } from "@/lib/data";

type CompatibilityEntry = {
  worksWell: string[];
  conflicts: string[];
  untested: string[];
};

type CompatibilityMap = Record<string, Partial<CompatibilityEntry>>;

function resolveSkillName(slug: string): string {
  return getSkillBySlug(slug)?.name ?? slug;
}

function SlugBadgeList({
  title,
  slugs,
  className,
}: {
  title: string;
  slugs: string[];
  className: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">{title}</h3>
      {slugs.length === 0 ? (
        <p className="text-sm text-muted-foreground">None reported.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slugs.map((slug) => (
            <Badge
              key={slug}
              variant="outline"
              className={`text-xs ${className}`}
              asChild
            >
              <Link href={`/skills/${slug}`}>{resolveSkillName(slug)}</Link>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompatibilityMatrix({ skillSlug }: { skillSlug: string }) {
  const map = compatibilityData as CompatibilityMap;
  const entry = map[skillSlug];

  return (
    <section>
      <h2 className="text-lg font-semibold text-[#F8FAFC] mb-4">
        🧩 Compatibility
      </h2>

      {!entry ? (
        <p className="text-sm text-muted-foreground">
          No compatibility data yet — be the first to report!
        </p>
      ) : (
        <div className="grid gap-6">
          <SlugBadgeList
            title="Works well with"
            slugs={entry.worksWell ?? []}
            className="bg-green/10 text-green border-green/30 hover:bg-green/20"
          />

          <SlugBadgeList
            title="Known conflicts"
            slugs={entry.conflicts ?? []}
            className="bg-yellow/10 text-yellow border-yellow/30 hover:bg-yellow/20"
          />

          <SlugBadgeList
            title="Untested"
            slugs={entry.untested ?? []}
            className="bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
          />
        </div>
      )}
    </section>
  );
}
