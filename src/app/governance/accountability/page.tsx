/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import type { GovernanceFrameworkData } from "@/lib/governanceFramework";

type AccountabilityData = Pick<GovernanceFrameworkData, "accountability">;

export const metadata: Metadata = {
  title: "Accountability for Agent Operations — forAgents.dev",
  description:
    "Audit trails, decision logging, escalation protocols, and human-in-the-loop gates for accountable autonomous agents.",
};

export const dynamic = "force-dynamic";

const loggingExample = `type DecisionLog = {
  decisionId: string;
  timestamp: string;
  agentId: string;
  actorId: string;
  action: string;
  riskLevel: "low" | "medium" | "high";
  rationale: string;
  confidence: number;
  policyChecks: { ruleId: string; passed: boolean }[];
  escalationRequired: boolean;
};

export async function logDecision(entry: DecisionLog) {
  await auditStore.append({
    ...entry,
    timestamp: new Date().toISOString(),
  });

  if (entry.riskLevel === "high" || entry.escalationRequired) {
    await notifyHumanReviewer({
      decisionId: entry.decisionId,
      summary: entry.rationale,
      actorId: entry.actorId,
    });
  }
}`;

const hitlGateExample = `export async function runWithHumanGate(input: TaskInput) {
  const risk = assessRisk(input);

  if (risk.level !== "high") {
    return executeTask(input);
  }

  const approval = await requestApproval({
    requestedBy: input.actorId,
    summary: input.summary,
    timeoutMinutes: 30,
  });

  if (!approval.granted) {
    return { status: "blocked", reason: "human_approval_required" };
  }

  return executeTask(input);
}`;

async function getAccountabilityData(): Promise<AccountabilityData | null> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  const response = await fetch(`${proto}://${host}/api/governance/accountability`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AccountabilityData;
}

export default async function GovernanceAccountabilityPage() {
  const data = await getAccountabilityData();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <section className="mx-auto max-w-5xl px-4 py-16">
          <Link href="/governance" className="text-sm text-[#06D6A0] hover:underline">
            ← Back to governance hub
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#F8FAFC] md:text-5xl">
            Accountability Deep Dive
          </h1>
          <p className="mt-4 text-foreground/80">Accountability data is temporarily unavailable.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="mx-auto max-w-5xl px-4 py-16">
        <Link href="/governance" className="text-sm text-[#06D6A0] hover:underline">
          ← Back to governance hub
        </Link>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#F8FAFC] md:text-5xl">
          Accountability Deep Dive
        </h1>
        <p className="mt-4 text-foreground/80">
          Build reliable ownership and defensible evidence across every autonomous decision, so teams don't lose track of responsibility.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-card/30 p-5">
            <h2 className="text-xl font-semibold">Audit trail requirements</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
              {data.accountability.auditTrailRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-card/30 p-5">
            <h2 className="text-xl font-semibold">Decision logging patterns</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
              {data.accountability.decisionLoggingPatterns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-white/10 bg-card/30 p-5">
          <h2 className="text-xl font-semibold">Escalation protocols</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
            {data.accountability.escalationProtocols.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-xl border border-[#06D6A0]/30 bg-[#06D6A0]/10 p-5">
          <h2 className="text-xl font-semibold">Human-in-the-loop gate design</h2>
          <p className="mt-2 text-sm text-foreground/80">
            Use risk-tiered gates so low-risk actions flow automatically and high-impact actions pause
            for reviewer approval. Always enforce explicit deny-by-default behavior when approval is
            missing or times out.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
            <li>Define action classes with risk levels and required approver roles.</li>
            <li>Set strict decision timeouts and safe fallback behaviors.</li>
            <li>Capture reviewer identity, decision reason, and timestamp.</li>
            <li>Audit gate bypasses with mandatory post-hoc review.</li>
          </ul>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-card/30 p-5">
          <h2 className="text-xl font-semibold">Code examples: logging agent decisions</h2>
          <div className="mt-3 rounded-lg bg-black/40 p-4 text-xs text-foreground/90">
            <pre className="overflow-x-auto">{loggingExample}</pre>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-card/30 p-5">
          <h2 className="text-xl font-semibold">Code example: human approval gate</h2>
          <div className="mt-3 rounded-lg bg-black/40 p-4 text-xs text-foreground/90">
            <pre className="overflow-x-auto">{hitlGateExample}</pre>
          </div>
        </section>
      </section>
    </div>
  );
}
