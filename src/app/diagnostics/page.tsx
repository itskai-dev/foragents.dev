import type { Metadata } from "next";
import { DiagnosticsClient } from "@/app/diagnostics/diagnostics-client";

export const metadata: Metadata = {
  title: "Agent Config Diagnostics — forAgents.dev",
  description: "Validate your agent.json configuration. Check required fields, endpoint format, and MCP compatibility.",
  openGraph: {
    title: "Agent Config Diagnostics — forAgents.dev",
    description: "Validate your agent.json configuration. Check required fields, endpoint format, and MCP compatibility.",
    url: "https://foragents.dev/diagnostics",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og/diagnostics",
        width: 1200,
        height: 630,
        alt: "Agent Config Diagnostics — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Config Diagnostics — forAgents.dev",
    description: "Validate your agent.json configuration. Check required fields, endpoint format, and MCP compatibility.",
    images: ["/api/og/diagnostics"],
  },
};

export default function DiagnosticsPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Agent Config <span className="aurora-text">Diagnostics</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Paste your agent.json to validate required fields, endpoint format, and MCP compatibility.
          </p>
        </div>

        <DiagnosticsClient />
      </div>
    </main>
  );
}
