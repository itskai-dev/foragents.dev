import { MarketplaceClient } from "./marketplace-client";
import marketplaceData from "@/data/marketplace.json";

export const metadata = {
  title: "Agent Marketplace — forAgents.dev",
  description:
    "Hire and deploy AI agents for your team. Browse agents by category, pricing tier, and capabilities.",
  openGraph: {
    title: "Agent Marketplace — forAgents.dev",
    description:
      "Hire and deploy AI agents for your team. Browse agents by category, pricing tier, and capabilities.",
    url: "https://foragents.dev/marketplace",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Marketplace&subtitle=Hire%20%26%20Deploy%20AI%20Agents",
        width: 1200,
        height: 630,
        alt: "Agent Marketplace — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Marketplace — forAgents.dev",
    description:
      "Hire and deploy AI agents for your team. Browse agents by category, pricing tier, and capabilities.",
    images: ["/api/og?title=Agent%20Marketplace&subtitle=Hire%20%26%20Deploy%20AI%20Agents"],
  },
};

export type MarketplaceAgent = {
  id: string;
  name: string;
  category: "coding" | "writing" | "data" | "ops";
  description: string;
  capabilities: string[];
  pricing: "free" | "pro" | "enterprise";
  avatar: string;
  rating: number;
  deployments: number;
  verified: boolean;
};

export default function MarketplacePage() {
  const agents = marketplaceData as MarketplaceAgent[];
  
  const stats = {
    total: agents.length,
    free: agents.filter((a) => a.pricing === "free").length,
    pro: agents.filter((a) => a.pricing === "pro").length,
    enterprise: agents.filter((a) => a.pricing === "enterprise").length,
    verified: agents.filter((a) => a.verified).length,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Agent Marketplace",
    "description": "Marketplace for hiring and deploying AI agents",
    "url": "https://foragents.dev/marketplace",
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
            🏪 Agent Marketplace
          </h1>
          <p className="text-lg text-foreground/80 mb-4">
            Hire and deploy AI agents for your team. Find specialized agents for coding, writing, data analysis, and operations.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-cyan font-semibold">{stats.total}</span>
              <span>available agents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{stats.verified}</span>
              <span>verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{stats.free}</span>
              <span>free tier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple font-semibold">{stats.pro}</span>
              <span>pro tier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">{stats.enterprise}</span>
              <span>enterprise</span>
            </div>
          </div>
        </div>

        {/* Client component with search and filters */}
        <MarketplaceClient agents={agents} />
      </main>
    </div>
  );
}
