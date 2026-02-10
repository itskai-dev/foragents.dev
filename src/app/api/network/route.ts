import { NextResponse } from "next/server";
import skillsData from "@/data/skills.json";
import agentsData from "@/data/agents.json";
import mcpServersData from "@/data/mcp-servers.json";
import migrationData from "@/data/skill-migration-data.json";

type GraphNode = {
  id: string;
  label: string;
  type: "skill" | "agent" | "mcp";
  group: "skills" | "agents" | "mcp";
};

type GraphEdge = {
  source: string;
  target: string;
  type: "depends-on" | "agent-uses-skill" | "mcp-provides-tool";
};

type Skill = {
  slug: string;
  name: string;
  tags: string[];
};

type Agent = {
  handle: string;
  name: string;
  skills: string[];
};

type McpServer = {
  slug: string;
  name: string;
  category: string;
  description: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter((token) => token.length > 2)
  );
}

function computeClusters(nodes: GraphNode[], edges: GraphEdge[]): number {
  const adjacency = new Map<string, Set<string>>();

  for (const node of nodes) {
    adjacency.set(node.id, new Set());
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) continue;
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
  }

  const visited = new Set<string>();
  let clusters = 0;

  for (const node of nodes) {
    if (visited.has(node.id)) continue;

    clusters += 1;
    const queue = [node.id];
    visited.add(node.id);

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      for (const next of adjacency.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return clusters;
}

export async function GET() {
  const skills = skillsData as Skill[];
  const agents = agentsData as Agent[];
  const mcpServers = mcpServersData as McpServer[];

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeKeys = new Set<string>();

  const skillBySlug = new Map<string, Skill>();
  const skillMatchIndex = new Map<string, string>();

  for (const skill of skills) {
    const nodeId = `skill:${skill.slug}`;
    skillBySlug.set(skill.slug, skill);

    nodes.push({
      id: nodeId,
      label: skill.name,
      type: "skill",
      group: "skills",
    });

    skillMatchIndex.set(normalize(skill.slug), skill.slug);
    skillMatchIndex.set(normalize(skill.name), skill.slug);

    for (const tag of skill.tags) {
      const key = normalize(tag);
      if (!skillMatchIndex.has(key)) {
        skillMatchIndex.set(key, skill.slug);
      }
    }
  }

  for (const agent of agents) {
    const nodeId = `agent:${agent.handle}`;
    nodes.push({
      id: nodeId,
      label: agent.name,
      type: "agent",
      group: "agents",
    });

    const seenSkillEdges = new Set<string>();

    for (const agentSkillRaw of agent.skills ?? []) {
      const agentSkill = normalize(agentSkillRaw);
      const matchedSkillSlug = skillMatchIndex.get(agentSkill);
      if (!matchedSkillSlug) continue;

      const target = `skill:${matchedSkillSlug}`;
      const edgeKey = `${nodeId}->${target}:agent-uses-skill`;
      if (seenSkillEdges.has(edgeKey) || edgeKeys.has(edgeKey)) continue;

      seenSkillEdges.add(edgeKey);
      edgeKeys.add(edgeKey);
      edges.push({
        source: nodeId,
        target,
        type: "agent-uses-skill",
      });
    }
  }

  for (const mcp of mcpServers) {
    const nodeId = `mcp:${mcp.slug}`;
    nodes.push({
      id: nodeId,
      label: mcp.name,
      type: "mcp",
      group: "mcp",
    });

    const mcpTokens = new Set<string>([
      ...tokenize(mcp.slug),
      ...tokenize(mcp.name),
      ...tokenize(mcp.category),
      ...tokenize(mcp.description),
    ]);

    for (const skill of skills) {
      const skillTokens = new Set<string>([
        ...tokenize(skill.slug),
        ...tokenize(skill.name),
        ...skill.tags.map((tag) => normalize(tag)),
      ]);

      const hasOverlap = Array.from(mcpTokens).some((token) => skillTokens.has(token));
      if (!hasOverlap) continue;

      const target = `skill:${skill.slug}`;
      const edgeKey = `${nodeId}->${target}:mcp-provides-tool`;
      if (edgeKeys.has(edgeKey)) continue;

      edgeKeys.add(edgeKey);
      edges.push({
        source: nodeId,
        target,
        type: "mcp-provides-tool",
      });
    }
  }

  const dependencyMap =
    (migrationData as {
      compatibilityMatrix?: {
        dependencies?: Record<string, { requires?: string[] }>;
      };
    }).compatibilityMatrix?.dependencies ?? {};

  for (const [skillSlug, rule] of Object.entries(dependencyMap)) {
    if (!skillBySlug.has(skillSlug)) continue;

    for (const dependencySlug of rule.requires ?? []) {
      if (!skillBySlug.has(dependencySlug)) continue;

      const source = `skill:${skillSlug}`;
      const target = `skill:${dependencySlug}`;
      const edgeKey = `${source}->${target}:depends-on`;
      if (edgeKeys.has(edgeKey)) continue;

      edgeKeys.add(edgeKey);
      edges.push({ source, target, type: "depends-on" });
    }
  }

  const stats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    clusters: computeClusters(nodes, edges),
  };

  return NextResponse.json(
    { nodes, edges, stats },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
