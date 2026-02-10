import type { Metadata } from "next";
import ComplianceHubClient from "./compliance-hub-client";

export const metadata: Metadata = {
  title: "Agent Compliance Hub — forAgents.dev",
  description:
    "Track and monitor compliance readiness across GDPR, SOC2, HIPAA, ISO27001, and CCPA with framework-level checks.",
  openGraph: {
    title: "Agent Compliance Hub — forAgents.dev",
    description:
      "Track and monitor compliance readiness across GDPR, SOC2, HIPAA, ISO27001, and CCPA with framework-level checks.",
    url: "https://foragents.dev/compliance",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function CompliancePage() {
  return <ComplianceHubClient />;
}
