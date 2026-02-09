import { NetworkPageClient } from "./network-page-client";
import agentNetworkData from "@/data/agent-network.json";
import Link from "next/link";

export const metadata = {
  title: "Agent Network Graph — forAgents.dev",
  description:
    "Visualize the connections between AI agents. Explore skill dependencies, collaborations, and relationships in the agent ecosystem.",
  openGraph: {
    title: "Agent Network Graph — forAgents.dev",
    description:
      "Visualize the connections between AI agents. Explore skill dependencies, collaborations, and relationships in the agent ecosystem.",
    url: "https://foragents.dev/network",
    siteName: "forAgents.dev",
    type: "website",
    images: [
      {
        url: "/api/og?title=Agent%20Network&subtitle=Explore%20Connections",
        width: 1200,
        height: 630,
        alt: "Agent Network Graph — forAgents.dev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Network Graph — forAgents.dev",
    description:
      "Visualize the connections between AI agents. Explore skill dependencies, collaborations, and relationships in the agent ecosystem.",
    images: ["/api/og?title=Agent%20Network&subtitle=Explore%20Connections"],
  },
};

export type NetworkAgent = {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  category: string;
  trustScore: number;
  skills: string[];
};

export type NetworkConnection = {
  source: string;
  target: string;
  type: "uses-skill-from" | "collaborates-with" | "depends-on";
  strength: number;
};

export type NetworkData = {
  agents: NetworkAgent[];
  connections: NetworkConnection[];
};

export default function NetworkPage() {
  const data = agentNetworkData as NetworkData;
  const totalAgents = data.agents.length;
  const totalConnections = data.connections.length;

  // Find most connected agent
  const connectionCounts = new Map<string, number>();
  data.connections.forEach((conn) => {
    connectionCounts.set(conn.source, (connectionCounts.get(conn.source) || 0) + 1);
    connectionCounts.set(conn.target, (connectionCounts.get(conn.target) || 0) + 1);
  });
  
  const mostConnectedId = Array.from(connectionCounts.entries()).reduce(
    (max, [id, count]) => (count > max.count ? { id, count } : max),
    { id: "", count: 0 }
  );
  
  const mostConnectedAgent = data.agents.find((a) => a.id === mostConnectedId.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Agent Network Graph",
    "description": "Visualize connections between AI agents",
    "url": "https://foragents.dev/network",
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#F8FAFC] mb-3">
            🌐 Agent Network Graph
          </h1>
          <p className="text-lg text-foreground/80 mb-6">
            Explore the web of connections between AI agents. Click any node to see details.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm mb-6">
            <div className="flex items-center gap-2">
              <span className="text-cyan font-semibold">{totalAgents}</span>
              <span className="text-muted-foreground">agents</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple font-semibold">{totalConnections}</span>
              <span className="text-muted-foreground">connections</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">
                {mostConnectedAgent?.name || "N/A"}
              </span>
              <span className="text-muted-foreground">most connected</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-cyan"></div>
              <span>uses skill from</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-purple"></div>
              <span>collaborates with</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-emerald-400"></div>
              <span>depends on</span>
            </div>
          </div>
        </div>

        {/* Client-side interactive network */}
        <NetworkPageClient data={data} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
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
