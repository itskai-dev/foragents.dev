import { Suspense } from "react";

import { getAgents, getSkills, type Agent } from "@/lib/data";
import { parseCompareIdsParam } from "@/lib/compare";

import ComparePageClient from "@/components/compare/ComparePageClient";
import CompareSkillsPageClient from "@/components/compare/CompareSkillsPageClient";

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const skillsParam = firstParam(searchParams?.skills);
  const slugs = parseCompareIdsParam(skillsParam);

  const aParam = firstParam(searchParams?.a);
  const agentIds = parseCompareIdsParam(aParam);

  const isAgentCompare = agentIds.length > 0 && slugs.length === 0;

  if (isAgentCompare) {
    const ogImageUrl = "https://foragents.dev/api/og/compare?type=agents";
    return {
      title: "Compare agents — forAgents.dev",
      description: "Compare 2–4 agents side-by-side on forAgents.dev",
      openGraph: {
        title: "Compare agents — forAgents.dev",
        description: "Compare 2–4 agents side-by-side on forAgents.dev",
        url: "https://foragents.dev/compare",
        siteName: "forAgents.dev",
        images: [{ url: ogImageUrl, width: 1200, height: 630 }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Compare agents — forAgents.dev",
        description: "Compare 2–4 agents side-by-side on forAgents.dev",
        images: [ogImageUrl],
      },
    };
  }

  const ogImageUrl = slugs.length
    ? `https://foragents.dev/api/og/compare?skills=${encodeURIComponent(
        slugs.join(",")
      )}`
    : "https://foragents.dev/api/og/compare";

  const title = slugs.length
    ? `Compare skills: ${slugs.slice(0, 4).join(" vs ")} — forAgents.dev`
    : "Compare skills — forAgents.dev";

  return {
    title,
    description: "Compare up to 4 skills/kits side-by-side on forAgents.dev",
    openGraph: {
      title,
      description: "Compare up to 4 skills/kits side-by-side on forAgents.dev",
      url: "https://foragents.dev/compare",
      siteName: "forAgents.dev",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Compare up to 4 skills/kits side-by-side on forAgents.dev",
      images: [ogImageUrl],
    },
  };
}

export default function ComparePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const skillsParam = firstParam(searchParams?.skills);
  const slugs = parseCompareIdsParam(skillsParam);

  // Legacy agent compare mode: /compare?a=1,2,3
  const aParam = firstParam(searchParams?.a);
  const agentIds = parseCompareIdsParam(aParam);
  const isAgentCompare = agentIds.length > 0 && slugs.length === 0;

  if (isAgentCompare) {
    const agents = getAgents();
    const byId = new Map<string, Agent>(agents.map((ag) => [ag.id, ag]));
    const resolved = agentIds.map((id) => byId.get(id) || null);

    return (
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto px-4 py-10 text-muted-foreground">
              Loading comparison…
            </div>
          }
        >
          <ComparePageClient initialIds={agentIds} initialAgents={resolved} />
        </Suspense>
      </div>
    );
  }

  const allSkills = getSkills();

  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto px-4 py-10 text-muted-foreground">
            Loading comparison…
          </div>
        }
      >
        <CompareSkillsPageClient initialSlugs={slugs} allSkills={allSkills} />
      </Suspense>
    </div>
  );
}
