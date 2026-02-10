/* eslint-disable react/no-unescaped-entities */

import { Metadata } from "next";
import { NetworkClient } from "./network-client";

export const metadata: Metadata = {
  title: "Agent Network — forAgents.dev",
  description:
    "Explore the interconnected network of AI agents. Discover relationships, dependencies, and collaborations across the agent ecosystem.",
  openGraph: {
    title: "Agent Network — forAgents.dev",
    description:
      "Explore the interconnected network of AI agents. Discover relationships, dependencies, and collaborations across the agent ecosystem.",
    url: "https://foragents.dev/network",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Network&subtitle=Explore%20Agent%20Connections",
        width: 1200,
        height: 630,
        alt: "Agent Network — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Network — forAgents.dev",
    description:
      "Explore the interconnected network of AI agents. Discover relationships, dependencies, and collaborations across the agent ecosystem.",
    images: ["/api/og?title=Agent%20Network&subtitle=Explore%20Agent%20Connections"],
  },
};

export default function NetworkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Agent Network",
    "description": "Interactive visualization of AI agent connections and relationships",
    "url": "https://foragents.dev/network",
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-3">
            🕸️ Agent Network
          </h1>
          <p className="text-lg text-foreground/80">
            Explore the interconnected ecosystem of AI agents — discover relationships, dependencies, and collaborations.
          </p>
        </div>

        {/* Client component with interactive network */}
        <NetworkClient />
      </main>
    </div>
  );
}
