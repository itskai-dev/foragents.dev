/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import AuditComplianceClient from "./audit-compliance-client";

export const metadata: Metadata = {
  title: "Compliance Audit Tracker — forAgents.dev",
  description:
    "Track GDPR, SOC2, HIPAA, and ISO27001 findings with persistent audit data, filtering, and framework-level compliance scores.",
  openGraph: {
    title: "Compliance Audit Tracker — forAgents.dev",
    description:
      "Track GDPR, SOC2, HIPAA, and ISO27001 findings with persistent audit data, filtering, and framework-level compliance scores.",
    url: "https://foragents.dev/compliance/audit",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function AuditLogPage() {
  return <AuditComplianceClient />;
}
