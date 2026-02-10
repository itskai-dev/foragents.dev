/* eslint-disable react/no-unescaped-entities */

import { Separator } from "@/components/ui/separator";
import { buildTierSummaries, filterSponsors, readSponsorsData } from "@/lib/sponsor";
import { SponsorClient } from "./sponsor-client";

export const metadata = {
  title: "Sponsor the Agent Ecosystem — forAgents.dev",
  description:
    "Support the future of AI agents. Help us build tools, resources, and community infrastructure for agent developers worldwide.",
};

export default async function SponsorPage() {
  const data = await readSponsorsData();
  const initialTiers = buildTierSummaries(data.tiers, data.sponsors);
  const initialSponsors = filterSponsors(data.sponsors, { tier: "all", search: "" });

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-cyan/5 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/3 w-[40vw] h-[40vw] max-w-[520px] max-h-[520px] bg-purple/3 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#F8FAFC] mb-6">
            Support the Agent Ecosystem
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sponsorship helps us maintain free tools, resources, and infrastructure for the agent developer community.
          </p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <SponsorClient initialTiers={initialTiers} initialSponsors={initialSponsors} />
    </div>
  );
}
