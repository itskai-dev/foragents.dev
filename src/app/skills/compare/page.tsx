import { Suspense } from "react";

import { getSkills } from "@/lib/data";
import { parseCompareIdsParam } from "@/lib/compare";
import CompareSkillsPageClient from "@/components/compare/CompareSkillsPageClient";

export const metadata = {
  title: "Compare skills — forAgents.dev",
  description: "Compare up to 4 skills/kits side-by-side on forAgents.dev",
  openGraph: {
    title: "Compare skills — forAgents.dev",
    description: "Compare up to 4 skills/kits side-by-side on forAgents.dev",
    url: "https://foragents.dev/skills/compare",
    siteName: "forAgents.dev",
    type: "website",
  },
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

/**
 * Legacy route: /skills/compare
 *
 * Canonical compare route is now /compare?skills=slug,slug
 * This page remains as an alias to avoid breaking old links.
 */
export default function SkillComparePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const allSkills = getSkills();

  const skillsParam = firstParam(searchParams?.skills);
  const slugs = parseCompareIdsParam(skillsParam);

  // Legacy: /skills/compare?a=<skillIds>
  const aParam = firstParam(searchParams?.a);
  const ids = parseCompareIdsParam(aParam);

  const byIdToSlug = new Map(allSkills.map((s) => [s.id, s.slug] as const));
  const mappedFromIds = ids.map((id) => byIdToSlug.get(id)).filter(Boolean) as string[];

  const initialSlugs = slugs.length ? slugs : mappedFromIds;

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-4 py-10 text-muted-foreground">
            Loading comparison…
          </div>
        }
      >
        <CompareSkillsPageClient initialSlugs={initialSlugs} allSkills={allSkills} />
      </Suspense>
    </div>
  );
}
