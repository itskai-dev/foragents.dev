/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";
import { Shield } from "lucide-react";
import { TrustPageClient } from "./trust-page-client";

export const metadata: Metadata = {
  title: "Trust Center | forAgents.dev",
  description:
    "Real-time trust center data for security posture, compliance status, and incident history on forAgents.dev.",
  openGraph: {
    title: "Trust Center | forAgents.dev",
    description:
      "Real-time trust center data for security posture, compliance status, and incident history on forAgents.dev.",
    url: "https://foragents.dev/trust",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="w-14 h-14 text-[#06D6A0]" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-[#06D6A0]">Trust Center</h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Security posture and compliance data are served from persistent trust center records through the /api/trust endpoint.
          </p>
        </div>

        <TrustPageClient />
      </div>
    </div>
  );
}
