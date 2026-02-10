/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { ContributorsClient } from "./contributors-client";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Contribute to the Agent Ecosystem — forAgents.dev";
  const description =
    "Join forAgents.dev contributors, explore active roles, and apply to help build tools for the agent ecosystem.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://foragents.dev/contribute",
      siteName: "forAgents.dev",
      type: "website",
      images: [
        {
          url: "/api/og",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/api/og"],
    },
  };
}

export default function ContributePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <ContributorsClient />
      </main>
    </div>
  );
}
