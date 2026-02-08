import { Suspense } from "react";
import { getSkills, type Skill } from "@/lib/data";
import { parseCompareIdsParam } from "@/lib/compare";
import SkillComparePageClient from "@/components/compare/SkillComparePageClient";

export const metadata = {
  title: "Compare Skills — forAgents.dev",
  description: "Compare 2-3 skills side-by-side on forAgents.dev",
  openGraph: {
    title: "Compare Skills — forAgents.dev",
    description: "Compare 2-3 skills side-by-side on forAgents.dev",
    url: "https://foragents.dev/skills/compare",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Skills — forAgents.dev",
    description: "Compare 2-3 skills side-by-side on forAgents.dev",
  },
};

export default function SkillComparePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const aParam =
    typeof searchParams?.a === "string"
      ? searchParams.a
      : Array.isArray(searchParams?.a)
        ? searchParams?.a[0]
        : undefined;

  const ids = parseCompareIdsParam(aParam);

  const skills = getSkills();
  const byId = new Map<string, Skill>(skills.map((sk) => [sk.id, sk]));
  const resolved = ids.map((id) => byId.get(id) || null);

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-4 py-10 text-muted-foreground">
            Loading comparison…
          </div>
        }
      >
        <SkillComparePageClient 
          initialIds={ids} 
          initialSkills={resolved}
          allSkills={skills}
        />
      </Suspense>
    </div>
  );
}
