/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import type { GovernanceFrameworkData } from "@/lib/governanceFramework";

type SafetyData = Pick<GovernanceFrameworkData, "safety">;

export const metadata: Metadata = {
  title: "Safety Patterns for Agent Systems — forAgents.dev",
  description:
    "Sandboxing, rate limits, rollback controls, kill-switches, and incident response patterns for safe autonomous agents.",
};

export const dynamic = "force-dynamic";

const dangerousOpsTestPlan = `# Dangerous Operation Test Plan (Staging)

1) Build synthetic test data with no customer-sensitive payloads.
2) Enable strict sandbox profile (no external writes, limited network).
3) Run canary scenarios with capped budgets and request rates.
4) Inject failures (timeouts, malformed inputs, policy violations).
5) Validate containment, rollback, and escalation behavior.
6) Promote only after all safety assertions pass.`;

const incidentTemplate = `Incident ID:
Severity (P0-P3):
Detected At:
Owner:

Impact Summary:
Affected Systems:
Customer Impact:

Immediate Containment Actions:
Evidence Preserved:

Root Cause:
Corrective Actions:
Preventive Actions:

Communication Log:
Post-Incident Review Date:`;

async function getSafetyData(): Promise<SafetyData | null> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  const response = await fetch(`${proto}://${host}/api/governance/safety`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SafetyData;
}

export default async function GovernanceSafetyPage() {
  const data = await getSafetyData();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <section className="mx-auto max-w-5xl px-4 py-16">
          <Link href="/governance" className="text-sm text-[#06D6A0] hover:underline">
            ← Back to governance hub
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#F8FAFC] md:text-5xl">Safety Patterns</h1>
          <p className="mt-4 text-foreground/80">Safety data is temporarily unavailable.</p>
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
          Safety Patterns
        </h1>
        <p className="mt-4 text-foreground/80">
          Safety controls for minimizing harm while preserving useful agent autonomy, so one bad run doesn't cascade.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-card/30 p-5">
            <h2 className="text-xl font-semibold">Sandboxing strategies</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
              {data.safety.sandboxingStrategies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-card/30 p-5">
            <h2 className="text-xl font-semibold">Rate limiting and resource caps</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
              {data.safety.rateLimitingAndCaps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-4 rounded-xl border border-white/10 bg-card/30 p-5">
          <h2 className="text-xl font-semibold">Rollback and kill-switch patterns</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
            {data.safety.rollbackAndKillSwitch.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-card/30 p-5">
          <h2 className="text-xl font-semibold">Testing dangerous operations safely</h2>
          <p className="mt-2 text-sm text-foreground/80">
            Never validate high-risk pathways directly in production. Use staged rehearsals with
            synthetic data, enforced isolation, and explicit go/no-go safety checks.
          </p>
          <div className="mt-3 rounded-lg bg-black/40 p-4 text-xs text-foreground/90">
            <pre className="overflow-x-auto">{dangerousOpsTestPlan}</pre>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-[#06D6A0]/30 bg-[#06D6A0]/10 p-5">
          <h2 className="text-xl font-semibold">Incident response playbook template</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
            {data.safety.incidentResponseTemplate.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-3 rounded-lg bg-black/40 p-4 text-xs text-foreground/90">
            <pre className="overflow-x-auto">{incidentTemplate}</pre>
          </div>
        </section>
      </section>
    </div>
  );
}
