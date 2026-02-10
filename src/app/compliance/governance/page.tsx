/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GovernancePolicy } from "@/lib/governance";

export const metadata = {
  title: "Governance Framework — forAgents.dev",
  description:
    "Template governance framework for AI agent deployments including approval workflows, escalation paths, human oversight requirements, logging standards, and incident response.",
  openGraph: {
    title: "Governance Framework — forAgents.dev",
    description:
      "Template governance framework for AI agent deployments including approval workflows, escalation paths, human oversight requirements, logging standards, and incident response.",
    url: "https://foragents.dev/compliance/governance",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type GovernanceResponse = {
  policies: GovernancePolicy[];
  total: number;
};

function statusVariant(status: GovernancePolicy["status"]) {
  if (status === "active") {
    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  }

  if (status === "review") {
    return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  }

  return "bg-slate-500/10 text-slate-300 border-slate-500/30";
}

async function getPolicies(): Promise<GovernancePolicy[]> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  const response = await fetch(`${proto}://${host}/api/compliance/governance`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as GovernanceResponse;
  return payload.policies ?? [];
}

export default async function GovernanceFrameworkPage() {
  const policies = await getPolicies();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="relative overflow-hidden min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#06D6A0]/5 rounded-full blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 w-full">
          <Link
            href="/compliance"
            className="text-sm text-foreground/60 hover:text-[#06D6A0] transition-colors mb-4 inline-block"
          >
            ← Back to Compliance Hub
          </Link>
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">Live Policy Data</Badge>
          <h1 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Governance Framework
          </h1>
          <p className="text-xl text-foreground/80">Policies are now loaded from persistent governance data.</p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Governance Policies</span>
              <Badge className="bg-white/10 text-foreground border-white/20">{policies.length} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.map((policy) => (
                <article key={policy.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base text-[#F8FAFC]">{policy.title}</h3>
                    <Badge className={`capitalize border ${statusVariant(policy.status)}`}>{policy.status}</Badge>
                    <Badge className="capitalize border border-white/20 bg-white/5 text-foreground/80">
                      {policy.category.replace("-", " ")}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground/70 mb-3">{policy.description}</p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-foreground/70">
                    <div>
                      <span className="text-foreground/50">ID:</span> {policy.id}
                    </div>
                    <div>
                      <span className="text-foreground/50">Version:</span> {policy.version}
                    </div>
                    <div>
                      <span className="text-foreground/50">Approved by:</span> {policy.approvedBy}
                    </div>
                    <div>
                      <span className="text-foreground/50">Review date:</span> {policy.reviewDate}
                    </div>
                  </div>
                </article>
              ))}

              {policies.length === 0 ? (
                <p className="text-sm text-foreground/60">No governance policies found.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex gap-4 justify-between">
          <Link href="/compliance" className="text-sm text-foreground/60 hover:text-[#06D6A0] transition-colors">
            ← Back to Compliance Hub
          </Link>
          <Link href="/compliance/responsible-ai" className="text-sm text-[#06D6A0] hover:underline">
            Responsible AI →
          </Link>
        </div>
      </div>
    </div>
  );
}
