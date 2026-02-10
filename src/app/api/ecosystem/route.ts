import { NextResponse } from "next/server";
import skillsData from "@/data/skills.json";
import mcpServersData from "@/data/mcp-servers.json";
import agentsData from "@/data/agents.json";
import integrationsData from "@/../data/integrations.json";
import communityThreadsData from "@/../data/community-threads.json";
import eventsData from "@/../data/events.json";
import bountiesData from "@/../data/bounties.json";
import fallbackMapData from "@/../data/ecosystem-map.json";

type Skill = {
  name: string;
  tags: string[];
};

type McpServer = {
  name: string;
  category: string;
};

type Agent = {
  name: string;
  featured?: boolean;
  trustScore?: number;
};

type Integration = {
  name: string;
  installCount?: number;
};

type CommunityThread = {
  title: string;
  replyCount?: number;
  lastActivity?: string;
};

type CommunityEvent = {
  title: string;
  date: string;
  attendeeCount?: number;
};

type Bounty = {
  title: string;
  status: "open" | "claimed" | "submitted" | "completed";
  budget?: number;
};

type EcosystemCategoryId = "skills" | "agents" | "protocols" | "tools" | "community";

type EcosystemCategory = {
  id: EcosystemCategoryId;
  name: string;
  count: number;
  description: string;
  growth: number;
  topItems: string[];
};

type EcosystemResponse = {
  generatedAt: string;
  totals: {
    ecosystemNodes: number;
    skillCount: number;
    skillCategoryCount: number;
    mcpServerCount: number;
    agentCount: number;
    integrationCount: number;
    threadCount: number;
    eventCount: number;
    bountyCount: number;
  };
  communityStats: {
    threads: number;
    events: number;
    bounties: number;
    openBounties: number;
  };
  categories: EcosystemCategory[];
  connections: Array<{
    from: EcosystemCategoryId;
    to: EcosystemCategoryId;
    description: string;
  }>;
  usedFallback: boolean;
};

function clampGrowth(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.round(value)));
}

function growthFromCount(count: number, multiplier: number, offset: number): number {
  return clampGrowth(count * multiplier + offset);
}

function topTags(skills: Skill[], limit = 5): string[] {
  const tagCounts = new Map<string, number>();

  for (const skill of skills) {
    for (const tag of skill.tags ?? []) {
      const key = tag.trim().toLowerCase();
      if (!key) continue;
      tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => `${tag} (${count})`);
}

function toFallbackResponse(): EcosystemResponse {
  const fallbackCategories = (fallbackMapData as { categories: EcosystemCategory[] }).categories;

  const categoryById = new Map(fallbackCategories.map((category) => [category.id, category]));
  const skills = categoryById.get("skills")?.count ?? 0;
  const agents = categoryById.get("agents")?.count ?? 0;
  const tools = categoryById.get("tools")?.count ?? 0;
  const protocols = categoryById.get("protocols")?.count ?? 0;
  const community = categoryById.get("community")?.count ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      ecosystemNodes: skills + agents + tools + protocols + community,
      skillCount: skills,
      skillCategoryCount: 0,
      mcpServerCount: protocols,
      agentCount: agents,
      integrationCount: tools,
      threadCount: 0,
      eventCount: 0,
      bountyCount: 0,
    },
    communityStats: {
      threads: 0,
      events: 0,
      bounties: 0,
      openBounties: 0,
    },
    categories: fallbackCategories,
    connections: [
      { from: "skills", to: "agents", description: "Skills are installed and orchestrated by agents." },
      { from: "protocols", to: "tools", description: "Protocols define how tools are exposed and consumed." },
      { from: "community", to: "skills", description: "Community requests and feedback inspire new skills." },
    ],
    usedFallback: true,
  };
}

function computeEcosystemOverview(): EcosystemResponse {
  const skills = skillsData as Skill[];
  const mcpServers = mcpServersData as McpServer[];
  const agents = agentsData as Agent[];
  const integrations = integrationsData as Integration[];
  const communityThreads = communityThreadsData as CommunityThread[];
  const events = eventsData as CommunityEvent[];
  const bounties = bountiesData as Bounty[];

  const skillTags = new Set(
    skills
      .flatMap((skill) => skill.tags ?? [])
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  );

  const mcpCategories = new Set(mcpServers.map((server) => server.category));

  const protocolsTopItems = [
    "Model Context Protocol (MCP)",
    "Agent Client Protocol (ACP)",
    "A2A",
    "OpenAPI",
    ...Array.from(mcpCategories).slice(0, 2).map((category) => `MCP category: ${category}`),
  ].slice(0, 5);

  const featuredAgents = agents
    .slice()
    .sort((a, b) => {
      const trustA = a.trustScore ?? 0;
      const trustB = b.trustScore ?? 0;
      return trustB - trustA;
    })
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  const topIntegrationItems = integrations
    .slice()
    .sort((a, b) => (b.installCount ?? 0) - (a.installCount ?? 0))
    .slice(0, 5)
    .map((integration) => integration.name);

  const topThreads = communityThreads
    .slice()
    .sort((a, b) => {
      const replyDiff = (b.replyCount ?? 0) - (a.replyCount ?? 0);
      if (replyDiff !== 0) return replyDiff;
      return new Date(b.lastActivity ?? 0).getTime() - new Date(a.lastActivity ?? 0).getTime();
    })
    .slice(0, 3)
    .map((thread) => thread.title);

  const upcomingEvents = events
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2)
    .map((event) => event.title);

  const activeBounties = bounties
    .filter((bounty) => bounty.status === "open" || bounty.status === "claimed")
    .sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
    .slice(0, 2)
    .map((bounty) => bounty.title);

  const categories: EcosystemCategory[] = [
    {
      id: "skills",
      name: "Skills",
      count: skills.length,
      description: `Curated skills with ${skillTags.size} distinct tags and reusable patterns.`,
      growth: growthFromCount(skills.length, 0.7, 8),
      topItems: topTags(skills),
    },
    {
      id: "agents",
      name: "Agents",
      count: agents.length,
      description: "Public agent profiles spanning orchestration, coding, research, and automation.",
      growth: growthFromCount(agents.length, 0.35, 6),
      topItems: featuredAgents.slice(0, 5).map((agent) => agent.name),
    },
    {
      id: "protocols",
      name: "Protocols",
      count: 1 + mcpCategories.size,
      description: `MCP plus ${mcpCategories.size} MCP server categories powering interoperability.`,
      growth: growthFromCount(mcpServers.length, 0.45, 5),
      topItems: protocolsTopItems,
    },
    {
      id: "tools",
      name: "Tools",
      count: integrations.length,
      description: "Integrations and operational tooling for storage, comms, security, and deployment.",
      growth: growthFromCount(integrations.length, 0.8, 7),
      topItems: topIntegrationItems,
    },
    {
      id: "community",
      name: "Community",
      count: communityThreads.length + events.length + bounties.length,
      description: "Forum threads, events, and bounties that drive ecosystem momentum.",
      growth: growthFromCount(communityThreads.length + events.length + bounties.length, 0.65, 9),
      topItems: [...topThreads, ...upcomingEvents, ...activeBounties].slice(0, 5),
    },
  ];

  const response: EcosystemResponse = {
    generatedAt: new Date().toISOString(),
    totals: {
      ecosystemNodes: categories.reduce((sum, category) => sum + category.count, 0),
      skillCount: skills.length,
      skillCategoryCount: skillTags.size,
      mcpServerCount: mcpServers.length,
      agentCount: agents.length,
      integrationCount: integrations.length,
      threadCount: communityThreads.length,
      eventCount: events.length,
      bountyCount: bounties.length,
    },
    communityStats: {
      threads: communityThreads.length,
      events: events.length,
      bounties: bounties.length,
      openBounties: bounties.filter((bounty) => bounty.status === "open").length,
    },
    categories,
    connections: [
      {
        from: "skills",
        to: "agents",
        description: "Agents install skills to execute tasks and workflows.",
      },
      {
        from: "protocols",
        to: "tools",
        description: "MCP and related standards connect integrations into agent runtimes.",
      },
      {
        from: "tools",
        to: "community",
        description: "Community members adopt integrations and report improvements.",
      },
      {
        from: "community",
        to: "skills",
        description: "Threads, events, and bounties shape what skills get built next.",
      },
    ],
    usedFallback: false,
  };

  return response;
}

export async function GET() {
  try {
    return NextResponse.json(computeEcosystemOverview(), {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Failed to compute ecosystem overview", error);

    return NextResponse.json(toFallbackResponse(), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
