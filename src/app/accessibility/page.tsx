/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { AccessibilityPageClient } from "./accessibility-page-client";

export const metadata: Metadata = {
  title: "Accessibility — forAgents.dev",
  description:
    "Live accessibility compliance status for forAgents.dev, including WCAG target level, audit checks, and remediation recommendations.",
  openGraph: {
    title: "Accessibility — forAgents.dev",
    description:
      "Live accessibility compliance status for forAgents.dev, including WCAG target level, audit checks, and remediation recommendations.",
    url: "https://foragents.dev/accessibility",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-[#06D6A0]">Accessibility</h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            We're publishing real accessibility audit data sourced from persistent records through the /api/accessibility endpoint.
          </p>
        </div>

        <AccessibilityPageClient />
      </div>
    </div>
  );
}
