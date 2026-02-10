/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GovernancePolicy } from "@/lib/governance";

export const metadata = {
  title: "Responsible AI Playbook — forAgents.dev",
  description:
    "Guidelines for ethical AI agent behavior including bias detection, transparency requirements, user consent patterns, data minimization, and explainability.",
  openGraph: {
    title: "Responsible AI Playbook — forAgents.dev",
    description:
      "Guidelines for ethical AI agent behavior including bias detection, transparency requirements, user consent patterns, data minimization, and explainability.",
    url: "https://foragents.dev/compliance/responsible-ai",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type GovernanceResponse = {
  policies: GovernancePolicy[];
  total: number;
};

type Principle = {
  title: string;
  description: string;
};

const principles: Principle[] = [
  {
    title: "Transparency",
    description: "Disclose AI usage and provide clear explanation paths for user-facing decisions.",
  },
  {
    title: "Bias Mitigation",
    description: "Run recurring fairness checks and require review gates for sensitive outcomes.",
  },
  {
    title: "Human Oversight",
    description: "Keep humans in the loop for high-risk workflows with clear override controls.",
  },
  {
    title: "Data Minimization",
    description: "Collect only necessary data and enforce bounded retention periods.",
  },
];

async function getEthicsPolicies(): Promise<GovernancePolicy[]> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  const response = await fetch(`${proto}://${host}/api/compliance/governance?category=ethics`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as GovernanceResponse;
  return payload.policies ?? [];
}

function statusClass(status: GovernancePolicy["status"]): string {
  if (status === "active") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  return "bg-slate-500/10 text-slate-300 border-slate-500/30";
}

export default async function ResponsibleAIPage() {
  const ethicsPolicies = await getEthicsPolicies();

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
          <Badge className="mb-4 bg-[#06D6A0]/10 text-[#06D6A0] border-[#06D6A0]/20">Ethics Policies (Live)</Badge>
          <h1 className="text-[40px] md:text-[48px] font-bold tracking-[-0.02em] text-[#F8FAFC] mb-4">
            Responsible AI Playbook
          </h1>
          <p className="text-xl text-foreground/80">Ethics-focused governance data is loaded from persistent policy records.</p>
        </div>
      </section>

      <Separator className="opacity-10" />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle>Core Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {principles.map((principle) => (
                <div key={principle.title} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <h3 className="font-semibold mb-2 text-[#F8FAFC]">{principle.title}</h3>
                  <p className="text-sm text-foreground/70">{principle.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <Card className="border-white/10 bg-card/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Ethics Policy Subset</span>
              <Badge className="bg-white/10 text-foreground border-white/20">{ethicsPolicies.length} policies</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ethicsPolicies.map((policy) => (
                <article key={policy.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base text-[#F8FAFC]">{policy.title}</h3>
                    <Badge className={`capitalize border ${statusClass(policy.status)}`}>{policy.status}</Badge>
                  </div>
                  <p className="text-sm text-foreground/70 mb-3">{policy.description}</p>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs text-foreground/70">
                    <div>
                      <span className="text-foreground/50">Version:</span> {policy.version}
                    </div>
                    <div>
                      <span className="text-foreground/50">Effective:</span> {policy.effectiveDate}
                    </div>
                    <div>
                      <span className="text-foreground/50">Review:</span> {policy.reviewDate}
                    </div>
                  </div>
                </article>
              ))}

              {ethicsPolicies.length === 0 ? (
                <p className="text-sm text-foreground/60">No ethics-focused policies found.</p>
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
          <Link href="/compliance/governance" className="text-sm text-[#06D6A0] hover:underline">
            Governance Framework →
          </Link>
        </div>
      </div>
    </div>
  );
}
