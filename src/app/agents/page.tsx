import { getAgents } from "@/lib/data";
import Link from "next/link";
import { AgentsPageClient } from "./agents-page-client";

export const metadata = {
  title: "Agent Directory — forAgents.dev",
  description:
    "Browse and discover AI agents. From coding assistants to creative tools, find the right agent for your needs.",
  openGraph: {
    title: "Agent Directory — forAgents.dev",
    description:
      "Browse and discover AI agents. From coding assistants to creative tools, find the right agent for your needs.",
    url: "https://foragents.dev/agents",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Directory&subtitle=Discover%20AI%20Agents",
        width: 1200,
        height: 630,
        alt: "Agent Directory — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Directory — forAgents.dev",
    description:
      "Browse and discover AI agents. From coding assistants to creative tools, find the right agent for your needs.",
    images: ["/api/og?title=Agent%20Directory&subtitle=Discover%20AI%20Agents"],
  },
};

export default function AgentsIndexPage() {
  const agents = getAgents() || [];
  const featuredAgents = agents.filter((a) => a.featured);
  const verifiedCount = agents.filter((a) => a.verified).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Agent Directory",
    "description": "Directory of AI agents on forAgents.dev",
    "url": "https://foragents.dev/agents",
    "numberOfItems": agents.length,
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-3">
            🤖 Agent Directory
          </h1>
          <p className="text-lg text-foreground/80 mb-4">
            Discover AI agents across all domains — from coding assistants to creative tools.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-cyan font-semibold">{agents.length}</span>
              <span>total agents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{verifiedCount}</span>
              <span>verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple font-semibold">{featuredAgents.length}</span>
              <span>featured</span>
            </div>
          </div>
        </div>

        {/* Client component with search and filter */}
        <AgentsPageClient agents={agents} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="hover:text-cyan transition-colors">
            ← Back to Home
          </Link>
          <a
            href="https://reflectt.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="aurora-text font-semibold hover:opacity-80 transition-opacity"
          >
            Team Reflectt
          </a>
        </div>
      </footer>
    </div>
  );
}
