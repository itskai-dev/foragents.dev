/* eslint-disable react/no-unescaped-entities */

import { Metadata } from "next";
import { ShowcaseClient } from "./showcase-client";

export const metadata: Metadata = {
  title: "Agent Showcase & Community Projects — forAgents.dev",
  description:
    "Explore community-submitted AI agent projects, filter by category, upvote favorites, and submit your own showcase entry.",
  openGraph: {
    title: "Agent Showcase & Community Projects — forAgents.dev",
    description:
      "Explore community-submitted AI agent projects, filter by category, upvote favorites, and submit your own showcase entry.",
    url: "https://foragents.dev/showcase",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Showcase&subtitle=Community%20Projects",
        width: 1200,
        height: 630,
        alt: "Agent Showcase & Community Projects — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Showcase & Community Projects — forAgents.dev",
    description:
      "Explore community-submitted AI agent projects, filter by category, upvote favorites, and submit your own showcase entry.",
    images: ["/api/og?title=Agent%20Showcase&subtitle=Community%20Projects"],
  },
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#F8FAFC] mb-4">🚀 Community Showcase</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Discover what builders are shipping, vote on what should trend, then submit your own
            project for the next wave of agent developers.
          </p>
        </div>

        <ShowcaseClient />
      </main>
    </div>
  );
}
