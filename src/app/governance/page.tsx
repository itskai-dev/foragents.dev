/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import GovernanceReadiness from "./GovernanceReadiness";
import type { GovernanceFrameworkData } from "@/lib/governanceFramework";

export const metadata: Metadata = {
  title: "Agent Governance Framework — forAgents.dev",
  description:
    "Best-practice governance framework for autonomous agents covering accountability, transparency, safety, and compliance.",
};

export const dynamic = "force-dynamic";

type GovernanceHubResponse = Pick<
  GovernanceFrameworkData,
  "overview" | "pillars" | "readinessChecklist" | "maturityCriteria"
>;

async function getGovernanceHubData(): Promise<GovernanceHubResponse | null> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  const response = await fetch(`${proto}://${host}/api/governance`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GovernanceHubResponse;
}

export default async function GovernancePage() {
  const data = await getGovernanceHubData();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-[#F8FAFC] md:text-5xl">
            Agent Governance Framework
          </h1>
          <p className="mt-4 text-foreground/80">Governance framework data is temporarily unavailable.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-sm text-[#06D6A0]">Governance Framework Hub</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#F8FAFC] md:text-5xl">{data.overview.title}</h1>
        <p className="mt-4 max-w-3xl text-foreground/80">
          {data.overview.description} Governance isn't optional once agents can act independently.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-card/30 p-6">
          <h2 className="text-xl font-semibold">Why governance matters for autonomous agents</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground/80">
            {data.overview.whyItMatters.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Four governance pillars</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {data.pillars.map((pillar) => (
              <article key={pillar.slug} className="rounded-xl border border-white/10 bg-card/30 p-5">
                <h3 className="text-xl font-semibold text-[#06D6A0]">{pillar.title}</h3>
                <p className="mt-2 text-sm text-foreground/80">{pillar.description}</p>

                <div className="mt-4">
                  <p className="text-sm font-semibold">Key principles</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/80">
                    {pillar.keyPrinciples.map((principle) => (
                      <li key={principle}>{principle}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                  <p>
                    <span className="font-semibold">Basic:</span> {pillar.maturity.basic}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">Intermediate:</span> {pillar.maturity.intermediate}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">Advanced:</span> {pillar.maturity.advanced}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <GovernanceReadiness
          checklist={data.readinessChecklist}
          maturityCriteria={data.maturityCriteria}
        />

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/governance/accountability" className="text-[#06D6A0] hover:underline">
            Accountability deep dive →
          </Link>
          <Link href="/governance/safety" className="text-[#06D6A0] hover:underline">
            Safety patterns →
          </Link>
        </div>
      </section>
    </div>
  );
}
