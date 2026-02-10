import type { Metadata } from "next";

import SetupWizardClient from "./SetupWizardClient";

export const metadata: Metadata = {
  title: "Agent Setup Wizard — forAgents.dev",
  description:
    "Configure your agent environment from scratch: detect host, install core kits, connect MCP servers, define identity, and verify readiness.",
  alternates: {
    canonical: "https://foragents.dev/setup",
  },
  openGraph: {
    title: "Agent Setup Wizard — forAgents.dev",
    description:
      "Multi-step setup wizard for agent environments with host presets, MCP connections, and verification checks.",
    url: "https://foragents.dev/setup",
    siteName: "forAgents.dev",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Setup Wizard — forAgents.dev",
    description:
      "Set up your agent environment with guided host detection, skills, MCP, identity, and health checks.",
  },
};

export const dynamic = "force-dynamic";

export default function SetupPage() {
  return <SetupWizardClient />;
}
