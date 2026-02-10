/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import TrustCenterClient from "./trust-center-client";

export const metadata: Metadata = {
  title: "Trust Center | forAgents.dev",
  description:
    "Persistent trust records covering security, privacy, compliance, and transparency for forAgents.dev.",
  openGraph: {
    title: "Trust Center | forAgents.dev",
    description:
      "Persistent trust records covering security, privacy, compliance, and transparency for forAgents.dev.",
    url: "https://foragents.dev/trust-center",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <TrustCenterClient />
      </div>
    </div>
  );
}
